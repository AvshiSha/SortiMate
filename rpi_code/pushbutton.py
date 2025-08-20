import RPi.GPIO as GPIO
import time

# Use BCM pin numbering (GPIO numbers, not physical pins)
GPIO.setmode(GPIO.BCM)

BUTTON_PIN = 18  # <-- Change if you connected to a different GPIO

# Configure the pin as input with an internal pull-up resistor
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

print("Press the button (CTRL+C to exit)...")

try:
    while True:
        if GPIO.input(BUTTON_PIN) == GPIO.LOW:  # LOW = pressed (when wired to GND)
            print("Button pressed!")
            time.sleep(0.2)  # debounce delay
except KeyboardInterrupt:
    print("\nExiting...")
finally:
    GPIO.cleanup()
