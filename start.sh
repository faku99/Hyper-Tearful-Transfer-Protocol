#!/bin/bash
#
# Menu for launching steps.

scripts_dir=scripts

echo "Available steps:"
echo " 01 - Static HTTP server"
echo " 02 - Dynamic HTTP server"
echo " 03 - Reverse proxy (static configuration)"
echo " 04 - Simple AJAX request"
echo " 05 - Reverse proxy (dynamic configuration)"
echo -n "Which step would you like to execute? "

read step

if (( "$step" > "5" )) || (( "$step" < "0" )); then
    echo "Invalid input. Aborting."

    exit 1
else
    first_char=$(echo $step | head -c 1)
    if (( "$first_char" != "0" )); then
        step="0$step"
    fi
    source $scripts_dir/step$step.sh
fi
