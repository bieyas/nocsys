#!/bin/bash
# Jalankan sinkronisasi status PPPoE client dari Mikrotik setiap 5 menit
cd "$(dirname "$0")/.."
node scripts/syncMikrotikStatus.js
