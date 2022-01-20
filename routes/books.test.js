process.env.NODE_ENV === "test";
const app = require("../app");
const request = require("supertest");
const Book = require("../models/book");
const db = require("../db");

let mockBook;

beforeEach(async () => {
  mockBook = await Book.create({
    isbn: "0691161518",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Lane",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    year: 2017,
  });
});

afterEach(async () => {
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  await db.end();
});

describe("GET /", () => {
  test("get all books", async () => {
    const response = await request(app).get("/books");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ books: [mockBook] });
  });
});

describe("GET /:isbn", () => {
  test("get a book", async () => {
    const response = await request(app).get(`/books/${mockBook.isbn}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ book: mockBook });
  });
  test("no book with invalid isbn", async () => {
    const response = await request(app).get("/books/069116117");
    expect(response.statusCode).toEqual(404);
    expect(response.body.error.message).toEqual(
      "There is no book with an isbn '069116117"
    );
  });
});

describe("POST /", () => {
  test("create a book", async () => {
    const response = await request(app).post(`/books/`)
      .send({
        book: {
          isbn: "0691161517",
          amazon_url: "http://a.co/eobPtX3",
          author: "Jamie Lee",
          language: "english",
          pages: 584,
          publisher: "Rainbow",
          title: "Dogs are nicer than men",
          year: 2015,
        },
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      book: {
        isbn: "0691161517",
        amazon_url: "http://a.co/eobPtX3",
        author: "Jamie Lee",
        language: "english",
        pages: 584,
        publisher: "Rainbow",
        title: "Dogs are nicer than men",
        year: 2015,
      },
    });
  });
  test("cant create a book because of missing field(s)", async () => {
    const response = await request(app).post(`/books/`)
      .send({
        book: {
          isbn: "0691161517",
          amazon_url: "http://a.co/eobPtX3",
          author: "Jamie Lee",
          language: "english",
          pages: 584,
          publisher: "Rainbow",
          title: "Dogs are nicer than men",
        },
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body.error.message).toEqual([
      'instance.book requires property "year"',
    ]);
  });
});

describe("PUT /:isbn", () => {
  test("update the existing book", async () => {
    const response = await request(app).put(`/books/${mockBook.isbn}`)
      .send({
        book: {
          isbn: "0691161518",
          amazon_url: "http://a.co/eobPtX3",
          author: "Jones Lee",
          language: "italian",
          pages: 750,
          publisher: "Rainbow Bridge",
          title: "Dogs are nicer than men",
          year: 2005,
        },
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      book: {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX3",
        author: "Jones Lee",
        language: "italian",
        pages: 750,
        publisher: "Rainbow Bridge",
        title: "Dogs are nicer than men",
        year: 2005,
      },
    });
  });
  test("cannot update because of invalid isbn", async () => {
    const response = await request(app).put(`/books/552631654`)
    .send({
      book: {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX3",
        author: "Jones Lee",
        language: "italian",
        pages: 750,
        publisher: "Rainbow Bridge",
        title: "Dogs are nicer than men",
        year: 2005,
      },
    });
    expect(response.statusCode).toEqual(404);
    expect(response.body.error.message).toEqual("There is no book with an isbn '552631654");
  })
});

describe("DELETE /:isbn", () => {
    test("delete a book", async () => {
        const response = await request(app).delete(`/books/${mockBook.isbn}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ message: "Book deleted" });
    })
})