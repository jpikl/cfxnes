compare: prepare generate
	vimdiff nintendulator-formatted.log nescoffee-formatted.log

prepare:
	test -s nintendulator-formatted.log || sed "s/^\(....................\)...........................\(..........................\).*$$/\1\2/g" nintendulator.log | head -n 3000 > nintendulator-formatted.log

generate:
	coffee ../src/Main.coffee -d nestest.nes 3000 > nescoffee.log
	grep -v "Flags" nescoffee.log | grep -v "\-\-\-" | sed "s/^..................\(.....\).\(..........\).\(.....\)....................\(..........................\).*$$/\1\2\3\4/g" | head -n 3000 > nescoffee-formatted.log

clean:
	rm -rf nintendulator-formatted.log
	rm -rf nescoffee-formatted.log
