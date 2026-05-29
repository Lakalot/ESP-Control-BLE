package expo.modules.ecbspp

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Base64
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

class EcbSppModule : Module() {
  private val adapter: BluetoothAdapter? get() = BluetoothAdapter.getDefaultAdapter()
  private val context: Context get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private var socket: BluetoothSocket? = null
  private var output: OutputStream? = null
  private var readThread: Thread? = null
  @Volatile private var intentional = false

  private var discoveryReceiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("EcbSpp")

    Events("onData", "onDisconnected", "onDeviceFound")

    AsyncFunction("isAvailable") {
      val a = adapter
      a != null && a.isEnabled
    }

    AsyncFunction("listBondedDevices") {
      val a = adapter ?: return@AsyncFunction emptyList<Map<String, Any?>>()
      a.bondedDevices.map { d ->
        mapOf("name" to d.name, "address" to d.address, "bonded" to true)
      }
    }

    AsyncFunction("startDiscovery") {
      val a = adapter ?: throw Exceptions.IllegalArgument("No Bluetooth adapter")
      stopDiscoveryInternal()
      val receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
          if (intent.action == BluetoothDevice.ACTION_FOUND) {
            val device: BluetoothDevice? =
              intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
            if (device != null) {
              sendEvent(
                "onDeviceFound",
                mapOf(
                  "name" to device.name,
                  "address" to device.address,
                  "bonded" to (device.bondState == BluetoothDevice.BOND_BONDED),
                ),
              )
            }
          }
        }
      }
      discoveryReceiver = receiver
      context.registerReceiver(receiver, IntentFilter(BluetoothDevice.ACTION_FOUND))
      a.startDiscovery()
    }

    AsyncFunction("stopDiscovery") {
      stopDiscoveryInternal()
    }

    AsyncFunction("connect") { address: String ->
      val a = adapter ?: throw Exceptions.IllegalArgument("No Bluetooth adapter")
      a.cancelDiscovery() // discovery slows/breaks RFCOMM
      stopDiscoveryInternal()
      val device = a.getRemoteDevice(address)
      // createRfcommSocketToServiceRecord pairs on the fly if needed (Android may
      // surface its native pairing dialog; we accept it as-is).
      val sock = device.createRfcommSocketToServiceRecord(SPP_UUID)
      try {
        intentional = false
        sock.connect()
      } catch (e: IOException) {
        try { sock.close() } catch (_: IOException) {}
        throw Exceptions.IllegalArgument("SPP connect failed: ${e.message}")
      }
      socket = sock
      output = sock.outputStream
      startReadLoop(sock.inputStream)
    }

    AsyncFunction("write") { base64: String ->
      val out = output ?: throw Exceptions.IllegalArgument("SPP not connected")
      val bytes = Base64.decode(base64, Base64.NO_WRAP)
      out.write(bytes)
      out.flush()
    }

    AsyncFunction("disconnect") {
      intentional = true
      closeSocket()
    }

    OnDestroy {
      intentional = true
      stopDiscoveryInternal()
      closeSocket()
    }
  }

  private fun startReadLoop(input: InputStream) {
    val thread = Thread {
      val buf = ByteArray(1024)
      try {
        while (!Thread.currentThread().isInterrupted) {
          val n = input.read(buf)
          if (n < 0) break // end of stream
          if (n > 0) {
            val chunk = Base64.encodeToString(buf, 0, n, Base64.NO_WRAP)
            sendEvent("onData", mapOf("data" to chunk))
          }
        }
      } catch (_: IOException) {
        // socket closed / link lost
      } finally {
        if (!intentional) {
          sendEvent("onDisconnected", mapOf<String, Any?>())
        }
      }
    }
    thread.isDaemon = true
    readThread = thread
    thread.start()
  }

  private fun closeSocket() {
    readThread?.interrupt()
    readThread = null
    try { output?.close() } catch (_: IOException) {}
    try { socket?.close() } catch (_: IOException) {}
    output = null
    socket = null
  }

  private fun stopDiscoveryInternal() {
    adapter?.cancelDiscovery()
    discoveryReceiver?.let {
      try { context.unregisterReceiver(it) } catch (_: IllegalArgumentException) {}
    }
    discoveryReceiver = null
  }
}
