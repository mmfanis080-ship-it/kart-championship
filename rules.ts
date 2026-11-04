export type PenaltyLevel = 3 | 5 | 7 | 10 | 'dsq' | 'info'

export type Rule = {
  text: string
  note?: string
  penalty: string
  level: PenaltyLevel
  stewards?: boolean
}

export type RuleCategory = { id: string; title: string; rules: Rule[] }

export const rulesEyebrow = 'Racing Kart Tournament 2026/27'
export const rulesTitle = 'Οδηγίες / Κανόνες'
export const basicRule = 'Κάθε ατύχημα / συμβάν εξετάζεται ΜΟΝΟ από βίντεο.'

export const categories: RuleCategory[] = [
  {
    id: 'fights',
    title: 'Μάχες & Χώρος',
    rules: [
      { text: 'Μη παραχώρηση χώρου (επαφή).', penalty: '3 πόντοι', level: 3 },
      { text: 'Μη παραχώρηση χώρου με αποτέλεσμα να βγει ο αντίπαλος εκτός πίστας.', penalty: '5 πόντοι', level: 5 },
      {
        text: 'Είσοδος σε στροφή χωρίς το «δικαίωμα του Apex» με απλή επαφή.',
        note: 'Δικαίωμα στη στροφή έχει κάποιος ΜΟΝΟ εφόσον η μπροστινή του ρόδα (εσωτερική) φτάσει στην πίσω ρόδα του εξωτερικού καρτ. 0 πόντοι αν δοθεί η θέση πίσω χωρίς να χαθεί ουσιαστικά χρόνος.',
        penalty: '5 πόντοι',
        level: 5,
      },
      { text: 'Χτύπημα χωρίς δικαίωμα στη στροφή που πετάει τον άλλον εκτός πίστας.', penalty: '7 πόντοι', level: 7 },
      {
        text: 'Επικίνδυνο ή επίτηδες χτύπημα/έξοδος.',
        penalty: 'Black Flag (DSQ)',
        level: 'dsq',
        stewards: true,
      },
    ],
  },
  {
    id: 'strict-corners',
    title: 'Αυστηρές Στροφές',
    rules: [
      {
        text: 'Συμβάντα στις στροφές 3, 7, 8 & την τελευταία ανηφορική (μικρότερο brake zone).',
        note: 'Απαιτείται «μαθηματική ακρίβεια» στην προσπέραση.',
        penalty: '5, 7 ή 10 πόντοι (ανάλογα το συμβάν)',
        level: 10,
        stewards: true,
      },
    ],
  },
  {
    id: 'defence',
    title: 'Άμυνα & Φρένα',
    rules: [
      { text: 'Αλλαγή πορείας στα φρένα (αναγκαστική αποφυγή από τον πίσω).', penalty: '3 πόντοι', level: 3 },
      { text: 'Αλλαγή πορείας στα φρένα που προκαλεί επαφή/ατύχημα.', penalty: '5 πόντοι', level: 5 },
    ],
  },
  {
    id: 'limits',
    title: 'Όρια & Επιστροφή',
    rules: [
      {
        text: 'Κόψιμο στροφής / εκτός πίστας για προσπέραση ή άμυνα.',
        note: '0 πόντοι αν επιστραφεί άμεσα η θέση.',
        penalty: '5 πόντοι',
        level: 5,
      },
      {
        text: 'Συστηματική παραβίαση ορίων πίστας.',
        note: '4η φορά, μετά από 3 warnings.',
        penalty: '5 πόντοι',
        level: 5,
      },
      { text: 'Επικίνδυνη επιστροφή (Unsafe rejoin) που αναγκάζει άλλον σε φρενάρισμα.', penalty: '5 πόντοι', level: 5 },
      { text: 'Επικίνδυνη επιστροφή στην πίστα που προκαλεί σύγκρουση.', penalty: '10 πόντοι', level: 10 },
    ],
  },
  {
    id: 'start',
    title: 'Εκκίνηση',
    rules: [
      {
        text: 'Άκυρη εκκίνηση (Jump Start) για κέρδος θέσεων.',
        note: '0 πόντοι αν αφήσει γκάζι και επιστρέψει τις θέσεις στην 1η ευθεία.',
        penalty: '5 πόντοι',
        level: 5,
      },
      { text: 'Άκυρη εκκίνηση που προκαλεί ατύχημα στην 1η στροφή.', penalty: '7 πόντοι', level: 7 },
    ],
  },
  {
    id: 'yellow',
    title: 'Yellow Flag (Κίτρινη)',
    rules: [
      {
        text: 'Μη τήρηση κανονισμών, προσπέραση (οποιουδήποτε ή του leader), ή εκκίνηση του αγώνα πριν το κατέβασμα του χεριού από τον leader.',
        penalty: '5 πόντοι',
        level: 5,
      },
      {
        text: 'Διαδικασία Leader στο Yellow Flag.',
        note: 'Σε σοβαρό ατύχημα, ο leader φτιάχνει «τρενάκι» και σηκώνει το χέρι. Αν δεν είναι σοβαρό, είναι στην κρίση του leader αν θα κάνει yellow flag ή αν θα συνεχίσει.',
        penalty: 'Διαδικαστικός κανόνας · 7 πόντοι',
        level: 7,
      },
      {
        text: 'Επιστροφή θέσης στο Yellow Flag.',
        note: 'Δυνατότητα επιστροφής θέσης δίνεται ΜΟΝΟ από τον leader. Σε αυτή την περίπτωση, όλοι οι άλλοι ακολουθούν και μόνο αυτός που παίρνει τη θέση προσπερνά.',
        penalty: 'Διαδικαστικός κανόνας · 7 πόντοι',
        level: 7,
      },
    ],
  },
  {
    id: 'blue',
    title: 'Blue Flags (Αργοί)',
    rules: [
      { text: 'Καθυστέρηση πρωτοπόρου (πάνω από 3-4 στροφές) ή άμυνα σε blue flag.', penalty: '5 πόντοι', level: 5 },
      { text: 'Πρόκληση ατυχήματος στον οδηγό που ρίχνει γύρο.', penalty: '7 πόντοι (ή Black Flag)', level: 7 },
    ],
  },
  {
    id: 'unsporting',
    title: 'Αντιαθλητική Συμπεριφορά',
    rules: [
      {
        text: 'Brake testing (επίτηδες πάτημα φρένου σε ευθεία/apex για να χτυπήσει ο πίσω).',
        penalty: '7 πόντοι',
        level: 7,
      },
      {
        text: 'Αντεκδίκηση (επίτηδες χτύπημα ως απάντηση σε προηγούμενο συμβάν).',
        penalty: 'Black Flag (DSQ)',
        level: 'dsq',
      },
    ],
  },
]
