import time
from sorting_mechanism import SortingMechanism, WasteType

def main():
    try:
        sorter = SortingMechanism(rotation_pin=17, gate_pin=27) 
        print("Smart Recycling Bin initialized...")
        
        # time.sleep(2)
        # sorter.gate_servo.set_angle(150)
        # time.sleep(2)
        # sorter.rotation_servo.set_angle(180)
        # time.sleep(2)
        # sorter.rotation_servo.set_angle(0)
        # time.sleep(2)
        
        print("moving gate to 90")
        sorter.gate_servo.set_angle(90)
        time.sleep(2)
        print("moving gate to 0")
        sorter.gate_servo.set_angle(0)
        time.sleep(2)
        print("moving gate to 90")
        sorter.gate_servo.set_angle(90)
        time.sleep(2)
        
        
    except KeyboardInterrupt:
        print("\nProgram interrupted by user")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Clean up GPIO resources
        sorter.cleanup()

if __name__ == "__main__":
    main()


# import time
# import os
# from sorting_mechanism import SortingMechanism, WasteType
# from Waste_recognition.CameraManager import CameraManager
# from Waste_recognition.Classifier import WasteClassifier
# import traceback
# from laser_sensor import LaserSensor
# from firebase_handler import FirebaseHandler
# from monitor_manager import MonitorManager
# from push_button import PushButton

# # Constants
# CLASSIFICATION_THRESHOLD = 0.8
# TIME_OUT_USER_ANSWER = 30

# # global variables
# user_answered = False
# user_choice = None
# active_user_listener = None
# current_active_user_state = False
# monitor = None
# active_user_changed = False  
# new_active_user_state = False

# def main():
#     try:
#         global user_answered, user_choice, monitor
#         # firebase_handler = FirebaseHandler()
#         sorter = SortingMechanism(rotation_pin=17, gate_pin=27)
#         # camera = CameraManager()
#         # classifier = WasteClassifier()
#         # # laser_sensor = LaserSensor(laser_pin=23)
#         # push_button = PushButton()

#         bin_id = load_bin_id()

#         monitor = MonitorManager(
#             window_size=(1920, 1080),
#             display=":0.0",
#             monitor_index=1  
#         )
#         monitor.show("default")

#         # Set up active_user listener
#         active_user_listener = firebase_handler.listen_for_active_user_changes(
#             bin_id, on_active_user_changed
#         )

#         print("Smart Recycling Bin initialized...")

#         while True:
#             try:
#                 print("Waiting for object to enter the bin...")
#                 # while not laser_sensor.is_beam_broken():
#                 #    time.sleep(0.1)
#                 while not push_button.is_button_pushed():
#                     check_and_update_active_user()
#                     time.sleep(0.1)

#                 monitor.show("classifying")
#                 print("New item detected!")
#                 image = camera.capture_image()
#                 predicted_label, confidence = classifier.waste_classification(image)
#                 real_predicted_label = predicted_label
#                 if predicted_label not in ["Plastic", "Glass", "Metal"]:
#                     predicted_label = "Other"
#                 print("Predicted waste type:", predicted_label)
#                 print("Predicted score:", confidence)

#                 if confidence > CLASSIFICATION_THRESHOLD and predicted_label != "Other":
#                     if predicted_label == "Plastic":
#                         waste_type = WasteType.PLASTIC
#                     elif predicted_label == "Glass":
#                         waste_type = WasteType.GLASS
#                     elif predicted_label == "Metal":
#                         waste_type = WasteType.METAL
#                 else:
#                     # TO ADD: monitor for this case
#                     monitor.show("low_confidence")
#                     user_answered = False
#                     user_choice = None
#                     waste_type = WasteType.OTHER
#                     image_cloudinary_link = camera.upload_image_to_cloudinary(bin_id, real_predicted_label, confidence)
#                     wrong_event_id = firebase_handler.log_wrong_classification(
#                         bin_id=bin_id,
#                         real_classified_waste_type=real_predicted_label,
#                         confidence=confidence,
#                         image_cloudinary_url=image_cloudinary_link,
#                         user_answered=user_answered
#                     )

#                     stop_listener = firebase_handler.listen_for_wrong_classification_answer(
#                         wrong_event_id, on_answered=on_answered)

                    
#                     start_wait = time.time()
#                     try: # Wait (with timeout) for the user's answer
#                         while not user_answered and time.time() - start_wait < TIME_OUT_USER_ANSWER:
#                             time.sleep(0.1)
#                     finally:
#                         try:
#                             stop_listener()
#                         except Exception:
#                             pass

#                     if user_answered:
#                         waste_type = WasteType[user_choice.upper()]
#                         try:
#                             firebase_handler.update_wrong_classification_user_answer(
#                                 wrong_event_id, user_choice
#                             )
#                             print(f"Updated wrong_classification document {wrong_event_id} with user choice: {user_choice}")
#                         except Exception as update_err:
#                             print(f"Failed to update wrong_classification document: {update_err}")
#                     else:
#                         print("No user answer within timeout; keeping OTHER")
            
#                 monitor.show(predicted_label)
#                 print(f"Sorting waste of type: {predicted_label}")
#                 sorter.sort_waste(waste_type)

#                 # time.sleep(3) # TO DELETE
#                 monitor.show("summary")            

#                 try:
#                     waste_event_id = firebase_handler.log_waste_event(
#                         bin_id=bin_id,
#                         waste_type=waste_type.name,
#                         confidence=confidence
#                     )
#                     print(f"Waste event logged with ID: {waste_event_id}")
#                 except Exception as log_err:
#                     print(f"Failed to log waste event: {log_err}")

#                 # Wait until beam is restored before detecting the next object
#                 # while laser_sensor.is_beam_broken():
#                 #    time.sleep(0.1)

#                 time.sleep(3)
#                 monitor.current_monitor_default(current_active_user_state)
                
#             except Exception as e:
#                 print(f"Error in main loop iteration: {e}")
#                 traceback.print_exc()
#                 print("Continuing to next iteration...")
#                 time.sleep(1)  # Brief pause before retrying

#     except KeyboardInterrupt:
#         print("\nProgram interrupted by user")

#     except Exception as e:
#         print(f"An error occurred: {e}")
#         traceback.print_exc()

#     finally:
#         print("END")  # TO DELETE
#         if active_user_listener:
#             active_user_listener()
#         sorter.cleanup()
#         # laser_sensor.cleanup()
#         push_button.cleanup()
#         monitor.stop()


# def load_bin_id(path="/home/pi/creds/bin_id.txt"):
#     try:
#         with open(path, "r") as f:
#             return f.read().strip()
#     except FileNotFoundError:
#         print(f"An error occurred with getting bin ID, Bin ID file not found at {path}")
#         traceback.print_exc()
#     except Exception as e:
#         print(f"An unexpected error occurred: {e}")
#         traceback.print_exc()

# # Start a focused listener for THIS item only
# def on_answered(doc):
#     global user_answered, user_choice
#     data = doc.to_dict() or {}
#     user_choice = data.get("user_classified_type")
#     user_answered = data.get("user_answered")
#     print(f"User answered: {user_choice}")

# # Callback for active_user changes
# def on_active_user_changed(active_user):
#     global active_user_changed, new_active_user_state, current_active_user_state
    
#     if active_user != current_active_user_state:
#         new_active_user_state = active_user
#         active_user_changed = True
#         print(f"Active user state changed to: {active_user}")

# def check_and_update_active_user():
#     """Check if active_user state changed and update monitor if needed"""
#     global active_user_changed, new_active_user_state, current_active_user_state
    
#     if active_user_changed:
#         current_active_user_state = new_active_user_state
#         if monitor:
#             updated = monitor.check_and_update_active_user_state(new_active_user_state)
#             if updated:
#                 print(f"Monitor automatically updated due to active_user change")
#         active_user_changed = False

# if __name__ == "__main__":
#     main()
