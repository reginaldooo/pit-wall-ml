// Question bank for quiz.html: normalises the compact rows in bank/*.js into the full schema.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory([1, 2, 3, 4, 5, 6].flatMap((n) => require(`./bank/m0${n}.js`)))
  } else root.QUIZ_DATA = factory(root.QuizBank || [])
})(typeof self !== 'undefined' ? self : this, function (rows) {
  const modules = [
    { id: 'm01', name: 'Machine learning fundamentals' },
    { id: 'm02', name: 'Deep learning' },
    { id: 'm03', name: 'Natural language processing' },
    { id: 'm04', name: 'PyTorch' },
    { id: 'm05', name: 'TensorFlow and Keras' },
    { id: 'm06', name: 'Tools, projects, roadmap' },
  ]
  // Rows are written with the right answer first-ish; rotating options by the id number spreads the
  // answer position evenly (the quiz also shuffles at display time).
  function rotate(row) {
    const shift = Number.parseInt(row.id.slice(-3), 10) % 4
    const options = row.options.map((_, i) => row.options[(i - shift + 4) % 4])
    return { options, answer: (row.answer + shift) % 4 }
  }
  const questions = rows.map((row) => ({ ...row, ...rotate(row) }))
  return { modules, questions }
})
