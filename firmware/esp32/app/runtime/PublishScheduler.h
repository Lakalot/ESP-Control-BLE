#pragma once

#include <stdint.h>

namespace app {

class PublishScheduler {
 public:
  explicit PublishScheduler(uint32_t intervalMs)
      : intervalMs_(intervalMs), lastPublishedMs_(0u), hasPublished_(false) {}

  bool shouldPublish(uint32_t nowMs) {
    if (!hasPublished_) {
      hasPublished_ = true;
      lastPublishedMs_ = nowMs;
      return true;
    }

    if (static_cast<uint32_t>(nowMs - lastPublishedMs_) < intervalMs_) {
      return false;
    }

    lastPublishedMs_ = nowMs;
    return true;
  }

 private:
  uint32_t intervalMs_;
  uint32_t lastPublishedMs_;
  bool hasPublished_;
};

}  // namespace app
