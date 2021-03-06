class Weekly {
  constructor(data) {
    this.applyData(data)
    this.state = 'partial'
    this.loadComments().then(UI.update)
    this.contributors = {}
    this.categories = {}
  }
  static isValid(data) {
    if (data.title.startsWith('Edição ') && data.repository_url === 'https://api.github.com/repos/braziljs/weekly') {
      if (data.labels.find(item => item.name === 'campaign')) {
        return true
      }
    }
    return false
  }
  applyData(data) {
    this.id = data.id
    this.title = data.title
    this.number = data.number
    ;(this.edition = this.title.match(' ([0-9]+) ')[1] || 0), (this.created_at = data.created_at)
    this.closed_at = data.closed_at
    this.state = data.state
  }
  filterData(data) {
    const { id, number, created_at, closed_at, title, state } = data
    return {
      id,
      number,
      edition: this.title.match(' ([0-9]+) ')[1] || 0,
      created_at,
      closed_at,
      title,
      state
    }
  }
  loadComments() {
    return new Promise((resolve, reject) => {
      if (this.comments) {
        return resolve(this.comments)
      }
      Github.get('comments', { issue: this.number }).then(comments => {
        comments.forEach(data => {
          if (data.body.charAt(0) !== '*') data.body = this.applyMarkdown(data.body)

          this.addComment(new Comment(data))
        })
        resolve(this)
      })
    })
  }
  addComment(comment) {
    this.contributors[comment.author.id] = comment.author
    this.categories[comment.category] = this.categories[comment.category] || []
    this.categories[comment.category].push(comment)
  }
  applyMarkdown(item) {
    item = item.replace(/^\[/, '**[')
    item = item.replace(/\)/, ')**')
    item = item.trim().replace(/(.+\w)$/, '*$1*')
    return item
  }
}
