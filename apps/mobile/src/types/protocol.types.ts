export enum ResponseStatus {
  OK = 0x00,
  ERROR_AUTH = 0x01,
  ERROR_UNKNOWN_CMD = 0x02,
  ERROR_INVALID_PAYLOAD = 0x03,
}

export enum AuthStatus {
  CHALLENGE = 0xf0,
  AUTH_OK = 0xf1,
  AUTH_FAIL = 0xf2,
}

export interface CommandFrame {
  cmdId: number;
  payload: Uint8Array;
  hmacHash: Uint8Array; // 4 bytes
}

export interface ResponseFrame {
  cmdId: number;
  status: ResponseStatus;
  payload: Uint8Array;
}
