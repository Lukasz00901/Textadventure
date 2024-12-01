// Hinweis: Diese Texte schaffen eine besondere Atmosphäre und sind sorgfältig auf die jeweiligen Orte abgestimmt.


// Sprüche für verschiedene Orte
const sprueche = {
  taverne: [
    "Der Duft von Braten, das Klirren der Krüge und ein Lachen, das ein bisschen zu laut klingt – hier fühlt sich jede Geschichte ein bisschen wahrer an.",
    "Ein Schritt hinein und du wirst vom warmen Licht der Kerzen, dem Summen von Stimmen und dem Geruch von starkem Bier umhüllt – willkommen in der Taverne!",
    "Die Luft ist dicht, die Musik rau und ein Hauch von Abenteuer liegt in der stickigen Wärme des Raumes.",
    "Der warme Schein von flackernden Kerzen erhellt die holzverkleideten Wände, während das Gelächter der Gäste und das Klirren von Bechern die Luft erfüllt.",
    "Das knisternde Feuer in der Ecke wirft lange Schatten, während die fröhlichen Lieder der Gäste mit dem Geruch von gegrilltem Fleisch vermischt sind.",
    "Die Wände vibrieren im Takt der Musik, während der Klang von Gläsern und das Gelächter der Gäste die Luft füllen.",
    "Rauchiger Bierdampf zieht in die Lungen, und die Wärme des Kamins hüllt alle in eine angenehme Trägheit, während die Gespräche sich über den Raum winden.",
    "Der Duft von altem Holz und frisch gezapftem Bier mischt sich mit dem angenehmen Chaos der Gespräche und dem Rauschen von Münzen in den Taschen der Kaufleute.",
    "Der Geruch von gebratenem Fleisch und frisch gebackenem Brot mischt sich mit dem süßen Duft des metgetränkten Luftraums, während die Gespräche der Gäste in der Luft hängen.",
    "Ein Humpen fliegt mit rasender Geschwindigkeit auf dich zu! Ducke dich!",
    "Der Duft von frischem Eintopf und geräuchertem Fleisch mischt sich mit dem knisternden Geräusch des Feuers, während Geschichten aus fernen Ländern erzählt werden.",
    "Die Luft ist voll von der Wärme der Feuerstelle und dem Klang von Lachen, wobei die Kerzen flackernde Schatten an die Wände werfen.",
    "In der Ecke hört man das Summen eines alten Barden, dessen Lieder das summende Murmeln der Gäste übertönen.",
    "Die rauchige Atmosphäre ist erfüllt von der Gemütlichkeit des Holzfeuers und dem Gelächter der Stammgäste, die sich an den rustikal gestalteten Tischen drängen.",
    "Das Knistern des Feuers mischt sich mit dem fröhlichen Gespräch der Gäste und dem gelegentlichen Klirren von Bechern, während die Luft von Bier und Braten durchzogen ist.",
    "Die Wärme des Kamins und der Duft von frisch gebackenem Brot machen den Raum zu einem gemütlichen Zufluchtsort vor der Kälte der Nacht.",
    "Lachen und fröhliche Gesänge mischen sich mit dem Klang von Hufen, die vor der Tür auf den schneebedeckten Boden schlagen.",
    "Die Luft ist schwer von der Mischung aus Rauch und dem Geruch von gegrilltem Fleisch, während ein Barde in der Ecke eine traurige Melodie spielt.",
    "Das Prasseln des Feuers und das Lachen der Gäste vermischen sich mit dem erdigen Duft von Holz und dem schweren Aroma des Met.",
    "Ein lautes Klirren von Gläsern und das Murmeln der Gespräche unterstreichen die gemütliche Wärme, während die flackernden Lichter die staubigen Ecken des Raumes erhellen.",
    "Die Luft ist voller Dämpfe von frisch gebratenem Fleisch und dem süßen Geruch von Honigwein, während die Gäste sich in vertrauten Gesprächen verlieren.",
    "Rauch aus dem Kamin zieht in die Ecken des Raumes, während das Stimmengemurmel der Gäste zu einem sanften Hintergrundgeräusch wird."
  ],
  wald: [
    "Du betrittst den Wald, wo die Blätter im Wind flüstern und das Licht durch das dichte Blätterdach tanzt.",
    "Hier verschluckt der Wald jedes Geräusch – außer deinem Knacken der Zweige und dem sanften Rascheln von etwas, das dir folgen könnte.",
    "Der Boden weich, die Luft kühl, und das Gefühl, dass dich hundert kleine Augen beobachten.",
    "Ein sanfter Wind rauscht durch die Bäume, und das zwitschern der Vögel wird nur von den leisen Rascheln der Blätter unterbrochen.",
    "Der dichte Nebel schleicht durch die Baumwipfel, während die Sonne nur in schüchternen Strahlen durch die Äste bricht, um das Dickicht in gespenstisches Licht zu tauchen.",
    "Der Boden ist weich und von Moos bedeckt, und die dicken Baumkronen lassen nur spärlich Sonnenstrahlen hindurch, die die Dunkelheit erleuchten.",
    "Der frische Duft von feuchtem Laub und die ruhigen Geräusche von Vögeln und fernen Tieren vermischen sich in der stillen Luft.",
    "Das Rascheln von Ästen und das Knacken von Zweigen unter den Füßen erzeugen eine leise Symphonie der Natur, die vom Wind getragen wird.",
    "Zwischen den Bäumen weht ein leichter Nebel, der die vertraute Landschaft in ein mystisches, fast unergründliches Licht taucht.",
    "Der Boden ist weich und feucht unter den Füßen, während die Bäume sich langsam im Wind wiegen und das Zwitschern von Vögeln die ruhige Stille erfüllt.",
    "Die Luft ist kühl und frisch, der Duft von Pilzen und Erde hängt in der Luft, und das Rascheln von Tieren ist überall zu hören.",
    "Zwischen den Bäumen scheint der Himmel wie ein blasses Band, das die dicke, grüne Decke des Waldes nur zaghaft durchbricht.",
    "Der Wald lebt in seiner eigenen Zeit, mit dem Rauschen des Windes in den Blättern und dem tiefen, beruhigenden Grollen eines fernen Donners.",
    "Die knorrigen Äste der Bäume werfen lange Schatten, während das leise Rascheln von Tieren und das Singen von Vögeln den Wald lebendig erscheinen lassen.",
    "Die feuchte Erde unter den Füßen riecht nach Pilzen und Moos, und die dichten Baumwipfel lassen nur vereinzelte Sonnenstrahlen hindurch.",
    "In der Ferne ist das leise Plätschern eines Baches zu hören, während der Wald ruhig und friedlich in seiner eigenen Zeit lebt.",
    "Die sanfte Brise trägt den Duft von frischem Holz und den fernes Plätschern eines Bachs durch die dichte Stille des Waldes.",
    "Das sanfte Rascheln der Blätter und das gelegentliche Zwitschern von Vögeln sind die einzigen Geräusche, während die dichte Baumdecke den Wald in ein gedämpftes Licht taucht.",
    "Die Sonne kämpft gegen den dichten Nebel und wirft schmale Strahlen auf den Boden, der von weichem Moos bedeckt ist.",
    "Der frische Duft von Tannennadeln und feuchtem Laub erfüllt die Luft, während der Wald in seiner tiefen Stille nur von gelegentlichen Tiergeräuschen unterbrochen wird.",
    "Der Boden unter den Füßen gibt nach, während das Licht in der Ferne schwindet und die Bäume die Dunkelheit einhüllen."
  ],
  mine: [
    "Ein Schritt in die Mine und du spürst die Kälte der Erde, das Dröhnen in der Ferne und den Geruch von feuchtem Stein.",
    "Hier drinnen ist die Luft schwer und die Dunkelheit endlos, nur das Echo deiner Schritte begleitet dich.",
    "Der dumpfe Klang der Spitzhacken, das Knirschen unter deinen Füßen – die Mine verschluckt jedes Licht und Geheimnis.",
    "Das gedämpfte Klopfen von Hämmern und das Echo von Hallen durchziehen die Dunkelheit, wo nur das schwache Licht von Fackeln die schmutzigen Wände erhellt.",
    "Die Erde scheint zu leben, als das ständige Scharren und Kratzen der Arbeiter gegen das Gestein hallt, und der schwache Dampf aus den Fackeln verleiht dem Raum eine unheimliche Atmosphäre.",
    "Der stetige Klang von pickenden Hämmern hallt durch die Dunkelheit, unterbrochen nur vom Rauschen des fallenden Gesteins und dem Knacken des Holzes.",
    "Der feuchte, erdige Geruch von Schmutz und Eisen liegt in der Luft, während die Arbeiter in ihren geschäftigen Gängen verschwinden.",
    "Schwache Fackeln werfen lange Schatten auf die Wände, deren Oberfläche von jahrhundertelangem Abbau und Feuchtigkeit gezeichnet ist.",
    "Das ständige Tropfen von Wasser und das schwere Atmen der Arbeiter in der stickigen Luft schaffen eine fast erdrückende, gedrückte Atmosphäre.",
    "Der unablässige Klang von Hämmern auf Eisen und das Rumpeln von schweren Wagen vermischen sich mit dem dumpfen Echo der unterirdischen Gänge.",
    "In der stickigen Luft liegt der Geruch von rostigem Eisen und feuchtem Gestein, während die Fackeln flimmern und die Dunkelheit nur für einen Moment vertreiben.",
    "Die Minenarbeiter schaufeln rhythmisch, während das leise Zischen des Wassers in den tiefen, vergessenen Bereichen des Tunnels zu hören ist.",
    "Überall im dunklen Bergwerk wimmelt es von Arbeitern, deren Ächzen und Seufzen von den Felsen wiedergegeben wird, während die Fackeln die tiefe Dunkelheit nur für einen Moment vertreiben.",
    "In der stickigen Luft der Mine schwingt der Klang der Hämmer wie ein düsteres Echo und lässt den Raum vibrieren.",
    "Das stetige Tropfen von Wasser und das Schaben der Werkzeuge an Gestein hallen durch die endlosen Gänge, die sich wie ein Labyrinth ausstrecken.",
    "Der dumpfe Klang von Eisen, das auf Stein trifft, und das leise Wimmern von müden Arbeitern mischen sich mit dem Geruch von feuchtem Felsen.",
    "Die Wände der Mine sind mit Moos bedeckt, und der Dampf aus den Fackeln tanzt in der feuchten Luft, während die Arbeiter sich im Dämmerlicht abmühen.",
    "Überall hört man das dumpfe Klopfen von Hämmern auf Stein, während das stetige Tropfen von Wasser die endlose Dunkelheit füllt.",
    "Das Brummen der Arbeiter und das ständige Rattern von Wägen mischen sich mit dem ekligen Klang von Holz, das in den engen Gängen knarrt.",
    "Das unaufhörliche Schlagen der Hämmer und der beißende Duft von Eisen und Schweiß lassen den Raum fast atemlos erscheinen.",
    "Der flimmernde Schein der Fackeln wirft geisterhafte Schatten an die feuchten Wände, während die Arbeiter sich in der Dunkelheit abmühen."
  ],
  markt: [
    "Der Markt ist ein lebendiger Teppich aus Farben, Stimmen und Gerüchen, die alle Sinne umschmeicheln – und dein Geldbeutel wird plötzlich leichter.",
    "Ein Schritt hinein und das Gemurmel der Händler, das Klappern der Stände und der Duft von exotischen Gewürzen versprechen Abenteuer.",
    "Hier wetteifern die Schreie der Händler mit dem Summen der Menge – und in der Luft hängt der Duft von frisch gebackenem Brot.",
    "Das bunte Treiben der Händler, das Rufen von Angeboten und das Klappern von Waren auf dem Pflaster verleihen dem Markt eine lebendige, hektische Atmosphäre.",
    "Der Markt pulsiert in einem bunten Farbenspiel von Stoffen, Gewürzen und Früchten, während das Stimmengewirr und das Rasseln von Münzen eine lebhafte Energie verbreiten.",
    "Du stolperst über einen herumstehenden Eimer!",
    "Der Markt pulsiert im Takt von Stimmen, Rufen und dem Rascheln von Stoffen, während Händler ihre Waren lautstark anpreisen.",
    "Zwischen den Ständen hängen bunte Stoffe, Gewürze und frische Waren, und der Lärm von feilschenden Käufern mischt sich mit den Geräuschen von harten Münzen auf Holz.",
    "Der Geruch von frischem Brot, exotischen Gewürzen und Leder mischt sich mit dem Lärm der geschäftigen Menge, die sich zwischen den Ständen bewegt.",
    "Lachende Kinder tummeln sich zwischen den Ständen, während die Händler ihre Waren mit einer Mischung aus Stolz und Dringlichkeit anpreisen.",
    "Der Markt ist ein lebendiges Durcheinander aus Rufen, dem Klappern von Münzen und dem stetigen Brummen von Verkäufern und Käufern, die sich zwischen den Ständen drängen.",
    "Das Gemurmel von Verhandlungen und das Rasseln von Waren mischen sich mit den frischen Gerüchen von Backwaren, Gewürzen und exotischen Kräutern.",
    "Die Sonne taucht den Markt in ein goldenes Licht, das die bunten Stände und den lebendigen Austausch von Waren noch lebendiger erscheinen lässt.",
    "Jeder Schritt auf dem staubigen Boden wird begleitet von den Rufen der Händler, die ihre Waren anpreisen, und dem ständigen Klingen von Münzen, die hin und her rollen.",
    "Das bunte Durcheinander aus Rufen, Lachen und dem Klicken von hölzernen Karrenrädern erweckt den Markt zu Leben, während frische Waren in alle Richtungen gehandelt werden.",
    "Der warme, süße Duft von Honig und frischem Brot mischt sich mit dem scharfen Aroma von exotischen Gewürzen, die von den Ständen wehen.",
    "Der Markt ist ein Ort der ständigen Bewegung, wo die Verkäufer laut ihre Waren anpreisen und die Passanten ihre Einkäufe erledigen.",
    "Das flimmernde Sonnenlicht scheint durch die bunten Stoffe der Zelte und taucht den Markt in ein lebendiges Farbenmeer.",
    "Das geschäftige Treiben der Händler, das Hämmern von Holz und das Rufen von Angeboten verschmelzen zu einem lauten, lebendigen Rhythmus.",
    "Der Duft von frischen Kräutern und warmen Gewürzen mischt sich mit dem Geräusch von Karrenrädern und dem Rasseln von Münzen.",
    "Bunte Stoffe wehen im Wind, während die Verkäufer ihre Waren lautstark anpreisen und die Passanten sich durch das Gewirr von Ständen und Karren schlängeln.",
    "Die Sonne taucht den Markt in ein warmes Licht, während das Hupen von Tieren und das Klirren von Gläsern eine geschäftige Atmosphäre schaffen."
  ],
  schmiede: [
    "Die Hitze schlägt dir entgegen, das metallische Hämmern hallt, und der Geruch von glühendem Eisen und Rauch zieht in die Nase.",
    "Betrittst du die Schmiede, prallen Funken, Glut und der Rhythmus des Hammers wie ein Herzschlag aufeinander.",
    "Hier ist alles aus Feuer und Stahl – die Luft schmeckt nach Rauch und versengtem Leder, und jeder Schlag des Hammers verspricht Stärke.",
    "Das ständige Hämmern des Ambosses und der heiße Funkenregen, der von der glühenden Esse aufsteigt, vermischen sich mit dem stechenden Geruch von Eisen und Rauch.",
    "Der gnadenlose Klang von Hammer auf Eisen füllt die Luft, während Funken wie Sterne über den Amboss fliegen.",
    "Die heiße, metallische Luft und der scharfe Duft von glühendem Stahl mischen sich mit dem ständigen Geräusch von Schmieden und Hämmern.",
    "Die Wände sind schwach erleuchtet von glühenden Kohlen, und der Schweiß der Arbeiter dampft in der schweren, warmen Luft.",
    "Der starke Klang von Eisen, das auf Eisen trifft, und das scharfe Zischen von Wasser, das den heißen Stahl küsst, bilden das rhythmische Herz der Schmiede.",
    "Die Hitze der Schmiedefeuer mischt sich mit dem metallischen Klang des Hammers, während die Luft mit dem Geruch von glühendem Stahl und Rauch schwer wird.",
    "Das rhythmische Hämmern des Schmiedes hallt durch den Raum, während der glühende Stahl in der Esse zu leben scheint und Funken in die Luft tanzen.",
    "Der Raum ist von der Hitze der Schmiedefeuer durchzogen, und der stechende Duft von verbranntem Öl mischt sich mit dem Klang von Eisen, das auf den Amboss trifft.",
    "Jeder Schlag des Hammers bringt das Metall zum Klingen, während der Schweiß des Schmiedes in der Luft verdampft und die Dampfmasse den Raum füllt.",
    "Die dunklen Wände sind mit Ruß bedeckt, und der Klang von Hammer auf Metall ist das Herz der Schmiede, das unermüdlich in der heißen Luft pocht.",
    "Das warme Licht des Feuers glüht in der Schmiede, während der Schweiß des Schmiedes von seiner Stirn tropft und die Funken in alle Richtungen fliegen.",
    "Der kräftige Schlag des Hammers auf das glühende Eisen wird vom flimmernden Licht der Kohlen und dem Geruch von geschmolzenem Stahl begleitet.",
    "Die Luft ist dicht und schwer vom Rauch und der Hitze des Feuers, während der Rhythmus der Hammerschläge fast meditativ wird.",
    "Mit jedem Schlag des Hammers formt der Schmied den glühenden Stahl, und die Hitze der Esse hüllt die Werkstatt in ein flimmerndes Licht.",
    "Die glühenden Kohlen flackern im Ofen und werfen tanzende Schatten, während das stetige Hämmern des Schmiedes den Raum mit Energie erfüllt.",
    "Die Luft ist heiß und voll von Funken, die in alle Richtungen fliegen, während der kräftige Schlag des Hammers den Rhythmus des Schmiedens bestimmt.",
    "Das dumpfe Zischen von heißem Stahl, der in kaltes Wasser getaucht wird, füllt den Raum, während der Geruch von glühendem Eisen sich mit dem Rauch vermischt.",
    "Der stetige Klang von Hammer und Amboss hallt durch den Raum, während der Schmied mit präzisen Bewegungen das Eisen formt."
  ],
  dungeon: [
    "Dunkle, feuchte Gänge winden sich durch das vergessene Labyrinth, während das tropfende Wasser und das entfernte Schaben von Ungeziefer die Stille durchbrechen.",
    "Die feuchte, stickige Luft ist von Modder und alter Steinstruktur durchzogen, und die Stille wird nur von gelegentlichem Tropfen von Wasser unterbrochen.",
    "Das kalte Gitter der eisernen Tür und der schwere Geruch von Eisen und Feuchtigkeit scheinen die Dunkelheit selbst zu erdrücken.",
    "Die gewundenen Gänge winden sich wie ein Albtraum, die feuchte Luft ist von einem dumpfen Echo von entfernten Schritten und leisen Geräuschen erfüllt.",
    "Die düstere Stille des Dungeons wird nur vom leisen Knistern der alten Fackeln unterbrochen, die die vergessenen Wände schwach erleuchten.",
    "Das Dröhnen der dicken Steintore hallt in den weitläufigen, labyrinthartigen Gängen, während der muffige Geruch von Fäulnis in der Luft hängt.",
    "In den engen, dunklen Gängen glimmen schwache Lichter von Fackeln und Kerzen, die flackernd die endlosen Schatten durchbrechen.",
    "Das feuchte, kalte Gitter der Wände ist von moosigen Flecken und dunklen Spritzern gezeichnet, während das stetige Tropfen von Wasser aus den Ritzen hallt.",
    "Die Luft ist schwer und drückend, der Boden uneben, und der leise Widerhall von entfernten Schritten lässt den Raum wie ein lebendes, atmendes Wesen erscheinen.",
    "Das schrille Knarren der alten Holztüren und das Schaben von Ketten an den Wänden hallen durch die leeren Gänge des Dungeons.",
    "Die kalte, feuchte Luft in den Korridoren lässt den Atem sichtbar werden, während das Geräusch von entfernten Tropfen und flüsternden Schatten die Stille füllt.",
    "Der Geruch von Moder und Eisen ist in der Luft, während der Boden uneben und rutschig wird, und das unheimliche Gefühl, beobachtet zu werden, wächst.",
    "Die Dunkelheit verschluckt alles, nur das sporadische Zischen von Fackeln und das leise Tropfen von Wasser brechen die Stille.",
    "Der scharfe Geruch von feuchtem Stein und Eisen durchdringt die Luft, während die Wände in der Dunkelheit verschwimmen und das Geräusch von Tropfen das einzige ist, was den Raum erfüllt.",
    "Das Echo von Schritten hallt in den endlosen Gängen, während der dichte Nebel die Sicht und die Geräusche verzerrt und der Raum in Dunkelheit gehüllt bleibt.",
    "Die Ketten an den Wänden klirren in der Stille, und das leise Tropfen von Wasser fügt sich in die bedrückende Stille des Dungeons ein.",
    "Die Wände sind kalt und feucht, der Boden rutschig, und das dumpfe Grollen aus der Tiefe lässt einen frösteln, während der Raum immer enger wird."
  ]
};

// Endpoint, um einen zufälligen Spruch für einen bestimmten Ort zu erhalten
app.get('/spruch/:ort', (req, res) => {
  const ort = req.params.ort.toLowerCase();
  if (sprueche[ort]) {
    const randomIndex = Math.floor(Math.random() * sprueche[ort].length);
    const spruch = sprueche[ort][randomIndex];
    res.json({ spruch });
  } else {
    res.status(404).json({ error: 'Ort nicht gefunden. Verfügbare Orte: Taverne, Wald, Mine, Markt, Schmiede, Dungeon.' });
  }
});
