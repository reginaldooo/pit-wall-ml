/* Learn pages: collapse the outline and contents on small screens, highlight the current section. */
(function () {
  'use strict'
  // Remember which articles were opened on this device (the pit-wall coach uses it to suggest reading).
  try {
    var match = /^\/learn\/([a-z0-9-]+)\/?$/.exec(location.pathname)
    if (match) {
      var seen = JSON.parse(localStorage.getItem('pwml.visited') || '[]')
      if (seen.indexOf(match[1]) < 0) { seen.push(match[1]); localStorage.setItem('pwml.visited', JSON.stringify(seen)) }
    }
  } catch (e) { /* optional */ }
  document.querySelectorAll('details[data-collapse-below]').forEach(function (details) {
    var query = window.matchMedia('(min-width: ' + details.getAttribute('data-collapse-below') + 'px)')
    function apply() { details.open = query.matches }
    apply()
    if (query.addEventListener) query.addEventListener('change', apply)
  })

  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'))
  if (!links.length || !('IntersectionObserver' in window)) return
  var byId = {}
  links.forEach(function (a) { byId[decodeURIComponent(a.getAttribute('href').slice(1))] = a })
  var headings = Object.keys(byId).map(function (id) { return document.getElementById(id) }).filter(Boolean)
  var visible = {}
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting })
    var current = headings.filter(function (h) { return visible[h.id] })[0]
    if (!current) return
    links.forEach(function (a) { a.removeAttribute('aria-current') })
    byId[current.id].setAttribute('aria-current', 'true')
  }, { rootMargin: '-72px 0px -65% 0px' })
  headings.forEach(function (h) { observer.observe(h) })
})()
