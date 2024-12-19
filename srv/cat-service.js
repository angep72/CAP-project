const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = cds.entities('sap.capire.bookshop')
    const { ListOfBooks } = this.entities

    // Add some discount for overstocked books
    this.after('each', ListOfBooks, book => {
      if (book.stock > 111) book.title += ` -- 11% discount!`
    })

    // Add new book to store
    this.on('addBook', async req => {
      const { title, author, stock, price } = req.data

      // Validate input data
      if (!title) return req.error(400, 'Title is required')
      if (!author) return req.error(400, 'Author is required')
      if (!stock || stock < 0) return req.error(400, 'Valid stock quantity is required')
      if (!price || price < 0) return req.error(400, 'Valid price is required')

      // Add new book to database
      const result = await INSERT.into(Books).entries({
        title,
        author,
        stock,
        price
      })

      // Emit event when a new book is added
      await this.emit('BookAdded', { 
        book: result.ID,
        title,
        author,
        stock,
        price,
        addedBy: req.user.id 
      })

      return result
    })

    // Reduce stock of ordered books if available stock suffices
    this.on('submitOrder', async req => {
      let { book: id, quantity } = req.data
      let book = await SELECT.one.from(Books, id, b => b.stock)

      // Validate input data
      if (!book) return req.error(404, `Book #${id} doesn't exist`)
      if (quantity < 1) return req.error(400, `quantity has to be 1 or more`)
      if (!book.stock || quantity > book.stock) return req.error(409, `${quantity} exceeds stock for book #${id}`)

      // Reduce stock in database and return updated stock value
      await UPDATE(Books, id).with({ stock: book.stock -= quantity })
      return book
    })

    // Emit event when an order has been submitted
    this.after('submitOrder', async (_, req) => {
      let { book, quantity } = req.data
      await this.emit('OrderedBook', { book, quantity, buyer: req.user.id })
    })

    // Delegate requests to the underlying generic service
    return super.init()
  }
}