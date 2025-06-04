import os
import time
import traceback
from sorting_mechanism import SortingMechanism, WasteType
from Waste_recognition.CameraManager import CameraManager
from laser_sensor import LaserSensor
from firebase_handler import (
    initialize_firebase,
    log_waste_event,
    update_bin_status,
    create_alert,
)


def main() -> None:
    credential_path = os.environ.get("FIREBASE_CREDENTIALS")
    initialize_firebase(credential_path=credential_path)
    sorter = None
    laser_sensor = None
    try:
        sorter = SortingMechanism(rotation_pin=27, gate_pin=22)
        identifier = CameraManager()
        laser_sensor = LaserSensor(laser_pin=23, receiver_pin=24)

        print("Smart Recycling Bin initialized...")
        print("Waiting for object to enter the bin...")

        bin_id = os.environ.get("BIN_ID", "bin_001")
        while True:
            laser_sensor.wait_for_beam_break()
            start_time = time.time()

            predicted_label, confidence = identifier.capture_image()
            latency_ms = int((time.time() - start_time) * 1000)

            if predicted_label == "Plastic":
                waste_type = WasteType.PLASTIC
            elif predicted_label == "Glass":
                waste_type = WasteType.GLASS
            elif predicted_label == "Metal":
                waste_type = WasteType.METAL
            else:
                waste_type = WasteType.OTHER

            print(f"Sorting waste of type: {predicted_label}")
            sorter.sort_waste(waste_type)

            log_waste_event(
                bin_id=bin_id,
                waste_type=predicted_label,
                latency_ms=latency_ms,
                confidence=confidence,
            )

            update_bin_status(bin_id=bin_id, alert_waste_type=predicted_label)
            create_alert(
                bin_id=bin_id,
                message=f"Sorted waste type {predicted_label}",
                alert_type="info",
            )

            while laser_sensor.is_beam_broken():
                time.sleep(0.1)

    except KeyboardInterrupt:
        print("\nProgram interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()
    finally:
        if sorter:
            sorter.cleanup()
        if laser_sensor:
            laser_sensor.cleanup()


if __name__ == "__main__":
    main()
