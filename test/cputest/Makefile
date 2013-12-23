CONF_FILE   = ../../test/cputest/TestConfig
TEST_FILE   = ../Main.coffee
TEST_ROM    = ../../roms/nestest.nes
NLT_LOG_RAW = nintendulator.log
NLT_LOG_FMT = nintendulator-formatted.log
NCF_LOG_RAW = nescoffee.log
NCF_LOG_FMT = nescoffee-formatted.log
STEPS       = 8000

compare: generate format
	vimdiff $(NLT_LOG_FMT) $(NCF_LOG_FMT)

generate:
	coffee $(TEST_FILE) $(CONF_FILE) $(TEST_ROM) $(STEPS) > $(NCF_LOG_RAW)

format: generate
	sed "s/^\(.\{20\}\).\{27\}\(.\{26\}\).*$$/\1\2/g" $(NLT_LOG_RAW) | head -n $(STEPS) > $(NLT_LOG_FMT)
	grep -v "PC" $(NCF_LOG_RAW) | grep -v "\-\-" | sed "s/^.\{18\}\(.\{5\}\).\(.\{10\}\).\(.\{5\}\).\{24\}\(.\{26\}\).*$$/\1\2\3\4/g" | head -n $(STEPS) > $(NCF_LOG_FMT)

clean:
	rm -rf $(NLT_LOG_FMT)
	rm -rf $(NCF_LOG_RAW)
	rm -rf $(NCF_LOG_FMT)
