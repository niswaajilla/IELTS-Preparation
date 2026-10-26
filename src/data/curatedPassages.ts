import { ReadingPassage } from '../types/index.ts';

export const curatedPassages: ReadingPassage[] = [
  {
    id: 'passage-rewilding',
    title: 'The Rewilding of European Ecosystems',
    topic: 'Conservation Biology & Environmental Science',
    wordCount: 740,
    difficulty: 'medium',
    paragraphs: [
      {
        letter: 'A',
        text: 'Across the European continent, centuries of intensive agriculture, industrial urbanization, and systematic predator eradication transformed vast primal forests into heavily managed, fragmented agrarian landscapes. However, an ambitious ecological paradigm known as "rewilding" is rapidly gaining traction among conservationists. Unlike traditional conservation, which often focuses on maintaining static historical conditions or artificially supporting endangered species through human intervention, rewilding advocates stepping back to let natural ecological processes restore equilibrium autonomously.'
      },
      {
        letter: 'B',
        text: 'A foundational tenet of the rewilding philosophy is the reintroduction of keystone species—organisms whose presence fundamentally structures an entire ecosystem. In the Romanian Carpathians and the Iberian Highlands, European bison (Bison bonasus) and wild horses have been reintroduced to abandoned agricultural valleys. As these large herbivores graze, their movement creates mosaic vegetation patterns, preventing dense scrubland from suffocating biodiversity while dispersing seeds over extensive ranges. Furthermore, their grazing mitigates catastrophic summer wildfire hazards by systematically consuming dry biomass.'
      },
      {
        letter: 'C',
        text: 'The return of apex carnivores represents the most controversial yet biologically essential dimension of the movement. In regions of Central Europe where grey wolves (Canis lupus) and Eurasian lynx have naturally recolonized or received legislative protection, researchers have documented profound changes in ungulate behavior. Rather than lingering indefinitely in riverine valleys where they overbrowse young saplings, red deer and roe deer now distribute themselves across broader territories. This behavioral shift, termed the "landscape of fear," has enabled riverbanks to regenerate with willows and alders, consequently stabilizing soil and creating vital habitats for beaver and migratory bird species.'
      },
      {
        letter: 'D',
        text: 'Despite notable ecological triumphs, rewilding initiatives encounter fierce political and socio-economic resistance from rural communities and agrarian lobbies. Farmers in pastoral mountain regions argue that the proliferation of large carnivores poses an existential threat to livestock, particularly free-ranging sheep and calves. While governments have established compensation funds for livestock losses, agricultural unions frequently criticize reimbursement bureaucracy as sluggish and insufficient. Moreover, traditional foresters contend that unmanaged wilderness promotes the unchecked proliferation of bark beetle infestations, which can spill over into commercial timber plantations.'
      },
      {
        letter: 'E',
        text: 'To bridge this ideological divide, proponents are pioneering innovative economic models centered on nature-based tourism and ecological payment schemes. In Portugal’s Côa Valley, former grazing lands have transitioned into private rewilding reserves where safari-style wildlife tracking and guided photography tours generate substantial local revenues. For depopulated rural municipalities suffering from youth emigration, rewilding is presented not merely as an ecological imperative, but as a viable economic catalyst capable of revitalizing regional commerce.'
      },
      {
        letter: 'F',
        text: 'Ultimately, rewilding does not seek a naive return to an ancient, pre-human Pleistocene wilderness, which would be impossible on a densely populated continent. Instead, it offers an adaptive vision of forward-looking coexistence. By relinquishing human compulsion to micromanage every hectare of land, society may discover that natural ecosystems possess an innate resilience to self-repair, creating dynamic landscapes where both human enterprise and wild nature can flourish simultaneously.'
      }
    ],
    headingsList: [
      { id: 'i', text: 'Economic alternatives for depopulated rural economies' },
      { id: 'ii', text: 'Opposition and anxieties among traditional agrarian sectors' },
      { id: 'iii', text: 'A philosophical departure from conventional conservation' },
      { id: 'iv', text: 'How herbivore grazing prevents catastrophic wildfires' },
      { id: 'v', text: 'Top-down trophic cascades triggered by predatory species' },
      { id: 'vi', text: 'A pragmatic compromise rather than historical recreation' }
    ],
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'matching_headings',
        instruction: 'Reading Passage has six paragraphs, A-F. Choose the correct heading for Paragraph A from the list of headings below.',
        statement: 'Paragraph A',
        options: ['i', 'ii', 'iii', 'iv', 'v', 'vi'],
        correctAnswer: 'iii',
        paragraphTarget: 'A',
        explanationId: 'Paragraf A menjelaskan bahwa rewilding adalah paradigma baru yang berbeda dari konservasi tradisional. Konservasi konvensional mempertahankan kondisi historis statis dengan intervensi manusia, sedangkan rewilding membiarkan proses alamiah bekerja otonom. Oleh karena itu, heading "A philosophical departure from conventional conservation" adalah jawaban yang tepat.',
        supportingQuote: 'Unlike traditional conservation, which often focuses on maintaining static historical conditions... rewilding advocates stepping back to let natural ecological processes restore equilibrium autonomously.'
      },
      {
        id: 'q2',
        number: 2,
        type: 'matching_headings',
        instruction: 'Choose the correct heading for Paragraph C from the list of headings.',
        statement: 'Paragraph C',
        options: ['i', 'ii', 'iii', 'iv', 'v', 'vi'],
        correctAnswer: 'v',
        paragraphTarget: 'C',
        explanationId: 'Paragraf C membahas bagaimana pemangsa puncak (grey wolves dan lynx) mengubah perilaku hewan pemakan rumput (ungulates), yang kemudian memungkinkan pohon di tepi sungai tumbuh kembali dan memulihkan habitat berang-berang. Fenomena ekologis dari pemangsa ke vegetasi ini dikenal sebagai trophic cascade. Jadi, heading "Top-down trophic cascades triggered by predatory species" paling akurat.',
        supportingQuote: 'The return of apex carnivores represents the most controversial yet biologically essential dimension... This behavioral shift, termed the "landscape of fear," has enabled riverbanks to regenerate...'
      },
      {
        id: 'q3',
        number: 3,
        type: 'matching_headings',
        instruction: 'Choose the correct heading for Paragraph D from the list of headings.',
        statement: 'Paragraph D',
        options: ['i', 'ii', 'iii', 'iv', 'v', 'vi'],
        correctAnswer: 'ii',
        paragraphTarget: 'D',
        explanationId: 'Paragraf D berfokus pada resistensi politis dan sosio-ekonomi dari komunitas pedesaan (rural communities) dan asosiasi petani terhadap ancaman predator pada ternak serta hama kumbang. Heading yang paling merefleksikan ide pokok ini adalah "Opposition and anxieties among traditional agrarian sectors".',
        supportingQuote: 'Despite notable ecological triumphs, rewilding initiatives encounter fierce political and socio-economic resistance from rural communities and agrarian lobbies.'
      },
      {
        id: 'q4',
        number: 4,
        type: 'tfng',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? Choose TRUE, FALSE, or NOT GIVEN.',
        statement: 'Large herbivores reintroduced in Europe contribute to lowering the risk of bushfires in hot seasons.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        paragraphTarget: 'B',
        explanationId: 'Pernyataan ini adalah **TRUE**. Paragraf B menyatakan secara eksplisit bahwa aktivitas merumput hewan herbivora besar mengurangi bahaya kebakaran hutan musim panas ("mitigates catastrophic summer wildfire hazards") dengan memakan biomassa kering yang mudah terbakar.',
        supportingQuote: 'Furthermore, their grazing mitigates catastrophic summer wildfire hazards by systematically consuming dry biomass.'
      },
      {
        id: 'q5',
        number: 5,
        type: 'tfng',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? Choose TRUE, FALSE, or NOT GIVEN.',
        statement: 'Farmers in mountain areas are satisfied with the speed of government financial compensation for lost livestock.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        paragraphTarget: 'D',
        explanationId: 'Pernyataan ini bertentangan (**FALSE**) dengan teks. Di paragraf D tertulis bahwa serikat petani kerap mengkritik birokrasi kompensasi pemerintah karena lambat dan tidak memadai ("sluggish and insufficient"), bukan puas.',
        supportingQuote: '...agricultural unions frequently criticize reimbursement bureaucracy as sluggish and insufficient.'
      },
      {
        id: 'q6',
        number: 6,
        type: 'tfng',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? Choose TRUE, FALSE, or NOT GIVEN.',
        statement: 'The tourism revenue generated in the Côa Valley is taxed at a special regional rate.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'NOT GIVEN',
        paragraphTarget: 'E',
        explanationId: 'Pernyataan ini adalah **NOT GIVEN**. Paragraf E memang menyebutkan bahwa safari wisata di Lembah Côa menghasilkan pendapatan lokal yang besar ("generate substantial local revenues"), namun tidak ada informasi mengenai tarif pajak khusus ("taxed at a special regional rate").',
        supportingQuote: '...safari-style wildlife tracking and guided photography tours generate substantial local revenues.'
      },
      {
        id: 'q7',
        number: 7,
        type: 'multiple_choice',
        instruction: 'Choose the correct letter, A, B, C or D.',
        question: 'According to Paragraph C, how has the presence of wolves indirectly benefitted riverside habitats?',
        options: [
          'A. By directly hunting and killing beaver predators in riverways.',
          'B. By forcing deer to avoid staying constantly in river valleys, allowing flora to recover.',
          'C. By creating artificial dams that increase water filtration.',
          'D. By driving all herbivorous mammals completely away from European mountains.'
        ],
        correctAnswer: 'B',
        paragraphTarget: 'C',
        explanationId: 'Jawaban yang tepat adalah **B**. Paragraf C menjelaskan fenomena "landscape of fear", di mana kawanan rusa tidak lagi berdiam tanpa henti di lembah sungai ("Rather than lingering indefinitely in riverine valleys..."), sehingga pohon willow dan alder dapat beregenerasi dan menstabilkan tanah.',
        supportingQuote: 'Rather than lingering indefinitely in riverine valleys where they overbrowse young saplings, red deer and roe deer now distribute themselves across broader territories. This behavioral shift... has enabled riverbanks to regenerate...'
      },
      {
        id: 'q8',
        number: 8,
        type: 'sentence_completion',
        instruction: 'Complete the sentence below. Choose NO MORE THAN TWO WORDS from the passage for the answer.',
        statement: 'According to paragraph B, the movement and feeding habits of European bison create varied [BLANK] across the landscape.',
        correctAnswer: 'mosaic vegetation patterns',
        acceptableAnswers: ['mosaic vegetation patterns', 'mosaic vegetation', 'vegetation patterns'],
        paragraphTarget: 'B',
        explanationId: 'Berdasarkan Paragraf B, pergerakan herbivora besar saat merumput menghasilkan pola vegetasi beraneka ragam ("creates mosaic vegetation patterns") yang mencegah semak belukar mencekik keanekaragaman hayati.',
        supportingQuote: 'As these large herbivores graze, their movement creates mosaic vegetation patterns, preventing dense scrubland from suffocating biodiversity...'
      }
    ],
    featuredVocab: [
      {
        word: 'mitigate',
        partOfSpeech: 'verb',
        definition: 'To make something less severe or serious.',
        indonesianMeaning: 'Meredakan atau meringankan dampak buruk.',
        synonyms: ['alleviate', 'reduce', 'lessen'],
        example: 'Grazing mitigates catastrophic summer wildfire hazards.'
      },
      {
        word: 'equilibrium',
        partOfSpeech: 'noun',
        definition: 'A state in which opposing forces or influences are balanced.',
        indonesianMeaning: 'Keseimbangan alamiah yang stabil.',
        synonyms: ['balance', 'stability', 'symmetry'],
        example: 'Natural processes restore ecological equilibrium autonomously.'
      },
      {
        word: 'proliferation',
        partOfSpeech: 'noun',
        definition: 'Rapid increase in numbers or spread.',
        indonesianMeaning: 'Perkembangan atau pertambahan pesat.',
        synonyms: ['multiplication', 'expansion', 'spread'],
        example: 'Foresters fear the unchecked proliferation of bark beetles.'
      },
      {
        word: 'imperative',
        partOfSpeech: 'noun',
        definition: 'An essential or urgent thing or requirement.',
        indonesianMeaning: 'Keharusan yang mendesak atau prioritas mutlak.',
        synonyms: ['necessity', 'essential', 'priority'],
        example: 'Rewilding is presented as an ecological imperative for the continent.'
      }
    ]
  },
  {
    id: 'passage-algorithmic-bias',
    title: 'Cognitive Biases in Algorithmic Decision-Making',
    topic: 'Artificial Intelligence & Ethics in Computer Science',
    wordCount: 710,
    difficulty: 'hard',
    paragraphs: [
      {
        letter: 'A',
        text: 'The widespread deployment of machine learning algorithms in critical societal domains—ranging from criminal justice sentencing and mortgage underwriting to medical diagnostics—was initially heralded as an objective antidote to fallible human judgment. Early computer scientists posited that mathematical models, free from emotional impulses and subjective preconceptions, would inevitably produce egalitarian outcomes. However, a decade of empirical scrutiny has debunked this technocratic optimism, demonstrating that algorithms routinely reproduce and exacerbate pre-existing systemic biases.'
      },
      {
        letter: 'B',
        text: 'Algorithmic bias predominantly originates not from malicious programming, but from historical data poisoning. Predictive algorithms are trained on vast longitudinal datasets reflecting centuries of historical discrimination and unequal law enforcement. For instance, predictive policing tools analyze historic arrest records rather than actual crime occurrences. Because low-income minority neighborhoods were historically subjected to disproportionate surveillance, the resulting data stream teaches the algorithm that criminality is concentrated in these demographics, creating a self-fulfilling feedback loop.'
      },
      {
        letter: 'C',
        text: 'A secondary, yet equally insidious mechanism is the "proxy variable" phenomenon. Even when engineers deliberately purge explicit sensitive attributes—such as ethnicity, gender, or religious affiliation—from training inputs, sophisticated neural networks identify subtle proxies that correlate strongly with protected categories. Postal codes, school graduation metrics, and credit transaction histories frequently serve as covert surrogates for racial and socio-economic demographics, allowing bias to persist covertly beneath a facade of statistical neutrality.'
      },
      {
        letter: 'D',
        text: 'Compounding the technical challenge is the psychological tendency known as "automation bias." Human operators—such as parole judges or recruitment officers tasked with reviewing algorithmic recommendations—frequently exhibit uncritical deference to automated outputs. Under time pressure or cognitive fatigue, human overseers operate under the assumption that algorithmic predictions are inherently superior to their own situational intuition, neutralizing the intended safety net of human-in-the-loop oversight.'
      },
      {
        letter: 'E',
        text: 'Addressing these systemic flaws requires moving beyond rudimentary technical fixes toward comprehensive socio-technical audits. While data scientists have developed mathematical parity techniques to balance false positive rates across demographic groups, scholars emphasize that mathematical fairness metrics are inherently contradictory and mutually exclusive. Consequently, rigorous algorithmic governance mandates multidisciplinary oversight involving civil rights jurists, ethicists, and affected communities alongside software architects.'
      }
    ],
    headingsList: [
      { id: 'i', text: 'The flawed illusion of objective impartiality' },
      { id: 'ii', text: 'How historical datasets encode institutional disparities' },
      { id: 'iii', text: 'Unintended demographic proxies in feature selection' },
      { id: 'iv', text: 'Excessive human reliance on automated recommendations' },
      { id: 'v', text: 'The necessity of multidisciplinary regulatory frameworks' }
    ],
    questions: [
      {
        id: 'ab-q1',
        number: 1,
        type: 'tfng',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? Choose TRUE, FALSE, or NOT GIVEN.',
        statement: 'Early computer scientists anticipated that algorithmic models would yield impartial and fair outcomes.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'TRUE',
        paragraphTarget: 'A',
        explanationId: 'Pernyataan ini adalah **TRUE**. Paragraf A menyebutkan bahwa para ilmuwan komputer awal berasumsi model matematika yang bebas dari emosi akan menghasilkan hasil yang merata ("egalitarian outcomes") dan menjadi obat penawar penilaian manusia yang rentan salah.',
        supportingQuote: 'Early computer scientists posited that mathematical models, free from emotional impulses... would inevitably produce egalitarian outcomes.'
      },
      {
        id: 'ab-q2',
        number: 2,
        type: 'tfng',
        instruction: 'Do the following statements agree with the information given in the Reading Passage? Choose TRUE, FALSE, or NOT GIVEN.',
        statement: 'Removing explicit markers like race or gender from algorithm training data guarantees unbiased decisions.',
        options: ['TRUE', 'FALSE', 'NOT GIVEN'],
        correctAnswer: 'FALSE',
        paragraphTarget: 'C',
        explanationId: 'Pernyataan ini adalah **FALSE**. Paragraf C menjelaskan tentang "proxy variable" di mana menghapus atribut sensitif tetap tidak menjamin netralitas, karena variabel lain seperti kode pos atau riwayat transaksi bertindak sebagai pengganti terselubung ("covert surrogates").',
        supportingQuote: 'Even when engineers deliberately purge explicit sensitive attributes... sophisticated neural networks identify subtle proxies... allowing bias to persist covertly...'
      },
      {
        id: 'ab-q3',
        number: 3,
        type: 'multiple_choice',
        instruction: 'Choose the correct letter, A, B, C or D.',
        question: 'What is the primary danger of "automation bias" described in Paragraph D?',
        options: [
          'A. Computer hardware often overheats when executing complex training loops.',
          'B. Human decision-makers uncritically accept automated predictions due to time constraints or fatigue.',
          'C. Engineers deliberately falsify performance benchmarks to please investors.',
          'D. Minorities refuse to interact with digital public services.'
        ],
        correctAnswer: 'B',
        paragraphTarget: 'D',
        explanationId: 'Jawaban benar adalah **B**. Paragraf D mendefinisikan "automation bias" sebagai kecenderungan pengawas manusia untuk tunduk tanpa kritis pada hasil algoritma saat lelah atau tertekan waktu ("frequently exhibit uncritical deference to automated outputs... Under time pressure or cognitive fatigue").',
        supportingQuote: 'Human operators... frequently exhibit uncritical deference to automated outputs. Under time pressure or cognitive fatigue, human overseers operate under the assumption that algorithmic predictions are inherently superior...'
      },
      {
        id: 'ab-q4',
        number: 4,
        type: 'sentence_completion',
        instruction: 'Complete the sentence below. Choose NO MORE THAN TWO WORDS from the passage for the answer.',
        statement: 'Predictive policing systems rely heavily on historical [BLANK] rather than genuine crime rates, leading to skewed assessments.',
        correctAnswer: 'arrest records',
        acceptableAnswers: ['arrest records', 'arrest record'],
        paragraphTarget: 'B',
        explanationId: 'Di paragraf B diterangkan bahwa alat kepolisian prediktif menganalisis catatan penangkapan historis ("historic arrest records") dan bukan angka kejahatan riil, yang memicu bias sistematis.',
        supportingQuote: 'For instance, predictive policing tools analyze historic arrest records rather than actual crime occurrences.'
      }
    ],
    featuredVocab: [
      {
        word: 'fallible',
        partOfSpeech: 'adjective',
        definition: 'Capable of making mistakes or being wrong.',
        indonesianMeaning: 'Dapat berbuat salah atau keliru.',
        synonyms: ['flawed', 'imperfect', 'error-prone'],
        example: 'Algorithms were initially marketed as an objective solution to fallible human judgment.'
      },
      {
        word: 'insidious',
        partOfSpeech: 'adjective',
        definition: 'Proceeding in a gradual, subtle way, but with harmful effects.',
        indonesianMeaning: 'Tersembunyi dan berbahaya secara perlahan namun merusak.',
        synonyms: ['subtle', 'stealthy', 'pernicious'],
        example: 'Proxy variables present an insidious obstacle to algorithmic justice.'
      },
      {
        word: 'deference',
        partOfSpeech: 'noun',
        definition: 'Humble submission and respect.',
        indonesianMeaning: 'Kepatuhan atau rasa hormat yang tunduk.',
        synonyms: ['submission', 'compliance', 'respect'],
        example: 'Operators exhibit uncritical deference to computerized outputs.'
      }
    ]
  }
];
