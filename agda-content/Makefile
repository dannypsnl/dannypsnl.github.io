AGDA := agda --html --html-highlight=code
targets := \
	html/agda.dbi.md \
	html/agda.subtype.md

all: $(targets)

html/agda.%.md: agda/%.lagda.md
	$(AGDA) $<
	cp $@ ../content/notes/

clean:
	rm $(targets)
