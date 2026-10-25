# Runs the fluency app straight from your laptop, without copying it to the badge.
#
#   mpremote mount badge-app run badge-app/tools/run_on_badge.py
#
# `mpremote mount` makes badge-app/ appear on the badge as /remote, so the app
# is at /remote/fluency. `launch` is the runtime helper the badge's own main.py
# uses to start apps. Not yet tried on hardware: if it fails, install the app
# through USB disk mode instead (see badge-app/README.md).

launch("/remote/fluency")  # noqa: F821  (provided by the badge runtime)
