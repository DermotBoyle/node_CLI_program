\***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\*** CSV/JSON STREAMING PROCESSER **\*\***\*\***\*\***\*\*\***\*\***\*\***\*\***

THE PROGRAM WORKS BY STATING THE PROGRAM NAME {csvConverter.js} FOLLOWED BY THE VENTAS(csv) THEN PRECIOS(json) FILE.

THE COMMAND LINE COMMAND WILL LOOK LIKE THIS :

./csvConverter.js --file=ventas.csv --file=precios.json

THE PROGRAM WILL RUN DISPLAYING THE PROCESS OF THE CSV TO JSON IN THE TERMINAL, IT WILL THEN GIVE A SUCCESS MESSAGE IF COMPLETED

THEN OUTPUT THE RESULT TO A {result.json} FILE IN THE SAME FOLDER.

**\*\***\*\*\*\***\*\***\*\***\*\***\*\*\*\***\*\*** PROCESS ****\*\*\*\*****\*\*****\*\*\*\*****\*\*****\*\*\*\*****\*\*****\*\*\*\*****

----> I USED THE INBUILT STREAMING API FROM NODE TO BE ABLE TO HANDLE VERY LARGE FILES (PROCESSING THE CSV FILS).

----> I ALSO COULD HAVE WORKED WITH ZIPPED FILES, UNZIPPED THEM FOR PROCESSING DURING THE STREAM AND CREATED A NEW
ZIPPED FINAL FILE, BUT THIS DID NOT SEEM SO NECESSARY IN THIS PROGRAM.

----> I USED REGEX TO CREATE A TEST OBJECT THAT WOULD PROCESS THE PROFITS ACCORDING TO THE PRECIOS SCHEME.

----> WHEN PROCESSING THE DATA I TRIED MY BEST TO AVOID CONTINUOUS (loops) LOOKING AND UPDATING OF OBJECTS, THIS IS WHY I CREATED ONE SIMPLE OBJECT
WITH A KEY VALUE PAIR FOR EACH CATEGORY. I WOULD LATER PROCESS THIS NEW OBJECT BECAUSE IT IS MUCH SMALLER AND FASTER TO DEAL WITH.

---> A SMALL {--help} FUNCTION WAS BUILT INTO THE PROGRAM AS AN EXAMPLE
