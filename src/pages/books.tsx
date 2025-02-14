"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";

interface Book {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  description: string;
}

const pageVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

export default function BooksPage() {
  const [hydrated, setHydrated] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [aiInsights, setAiInsights] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchAuthor, setSearchAuthor] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [editedBook, setEditedBook] = useState<Book | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 8;

  useEffect(() => {
    setHydrated(true);
    fetchBooks();
  }, [page]); // Reload data when refreshing

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/books", {
        params: { page, size: pageSize },
      });
      setBooks(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch {
      setError("Failed to load books.");
    }
    setLoading(false);
  };

  const fetchBookById = async (bookId: number) => {
    setSelectedBook(null); // Reset selected book

    try {
      const response = await axios.get(`http://localhost:8080/books/${bookId}`);
      setSelectedBook(response.data);
    } catch (error: any) {
      let errorMessage = "Failed to fetch book details.";

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = "Book not found. Please check the ID.";
        } else {
          errorMessage = `Error ${status}: ${
            error.response.data?.message || "Something went wrong"
          }`;
        }
      } else {
        errorMessage = "Unexpected error occurred.";
      }
      alert(errorMessage);
    }
  };

  const saveBookChanges = async () => {
    if (!editedBook) return;

    try {
      const response = await axios.put(
        `http://localhost:8080/books/${editedBook.id}`,
        editedBook
      );

      alert("Book successfully updated!");
      setBooks(
        books.map((book) => (book.id === editedBook.id ? editedBook : book))
      );
      setEditMode(false);
      setSelectedBook(null);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;

          if (status === 400) {
            const errors = error.response.data;
            const errorMessages = Object.values(errors).join("\n");
            alert(`Validation Error:\n${errorMessages}`);
          } else if (status === 404) {
            alert("Book not found. Please check the ID.");
          } else {
            alert(
              `Unexpected Error: ${
                error.response.data.message || "Something went wrong."
              }`
            );
          }
        } else {
          alert("Server is unreachable. Please try again later.");
        }
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  const deleteBook = async (bookId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/books/${bookId}`);
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      alert("Book deleted successfully!");
    } catch (error: any) {
      let errorMessage = "Failed to delete the book.";
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = "Book not found.";
        } else {
          errorMessage = `Error ${status}: ${
            error.response.data?.message || "Something went wrong."
          }`;
        }
      } else {
        errorMessage = "Unexpected error occurred.";
      }
      alert(errorMessage);
    }
  };

  const searchBooks = async () => {
    if (!searchTitle.trim() && !searchAuthor.trim()) {
      return; // Nu face request către backend
    }
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/books/search", {
        params: { title: searchTitle, author: searchAuthor },
      });
      setBooks(response.data);
    } catch {
      setError("Failed to search books.");
    }
    setLoading(false);
  };

  const fetchAiInsights = async (bookId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/books/${bookId}/ai-insights`
      );
      const data = response.data;

      setSelectedBook({
        id: data.id,
        title: data.title,
        author: data.author,
        publicationYear: data.publicationYear,
        description: data.description,
      });
      setAiInsights((prev) => ({
        ...prev,
        [bookId]: data.aiInsight,
      }));
    } catch (error: any) {
      let errorMessage = "Failed to fetch AI insights.";
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = "Book not found. Please check the ID.";
        } else if (status === 503) {
          errorMessage =
            "AI Insights service is currently unavailable. Please try again later.";
        } else {
          errorMessage = `Error ${status}: ${
            error.response.data?.message || "Something went wrong"
          }`;
        }
      } else if (error.request) {
        errorMessage =
          "No response from AI Insights service. Please check your network.";
      } else {
        errorMessage = "Unexpected error occurred.";
      }

      setAiInsights((prev) => ({
        ...prev,
        [bookId]: errorMessage,
      }));
      const selected = books.find((book) => book.id === bookId);
      if (selected) {
        setSelectedBook(selected);
      }
      alert(errorMessage);
    }
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className="relative h-screen overflow-auto bg-gray-900 text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/library-background.jpg"
          alt="Library Background"
          fill
          className="object-cover opacity-30"
        />
      </div>

      {/* Main content */}
      <div className="relative p-6 z-10">
        <h1 className="text-4xl font-bold text-center mb-8">Open Library</h1>

        {loading && <p className="text-center">Loading books...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}

        {/* Search bar */}
        <div className="flex justify-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by Title"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
          <input
            type="text"
            placeholder="Search by Author"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
          <button
            onClick={searchBooks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Search
          </button>
        </div>

        {/* Books list */}
        <motion.div
          key={page}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="p-4 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => fetchBookById(book.id)}
            >
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-gray-400">Author: {book.author}</p>
              <p className="text-gray-500">Published: {book.publicationYear}</p>

              <div className="mt-3 flex flex-wrap justify-between gap-2">
                {/* Insights button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchAiInsights(book.id);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded w-full sm:w-auto text-center"
                >
                  AI Insights
                </button>

                {/* Edit button */}
                <button
                  className="px-3 py-2 bg-green-600 text-white rounded w-full sm:w-auto text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBook(book);
                    setEditedBook({ ...book });
                    setEditMode(true);
                  }}
                >
                  Edit
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBook(book.id);
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded w-full sm:w-auto text-center"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Pagination buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-500"
          >
            Previous
          </button>
          <span className="text-white">{`Page ${
            page + 1
          } of ${totalPages}`}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:bg-gray-500"
          >
            Next
          </button>
        </div>
      </div>

      {/* Book detail modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => {
                setSelectedBook(null);
                setEditMode(false);
              }}
            >
              ✖
            </button>

            {editMode && editedBook ? (
              // Edit book form
              <div>
                <h2 className="text-2xl font-semibold">Edit Book</h2>
                <input
                  type="text"
                  className="w-full p-2 border rounded mt-2"
                  value={editedBook?.title || ""}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook!, title: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full p-2 border rounded mt-2"
                  value={editedBook?.author || ""}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook!, author: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="w-full p-2 border rounded mt-2"
                  value={editedBook?.publicationYear || ""}
                  onChange={(e) =>
                    setEditedBook({
                      ...editedBook!,
                      publicationYear: parseInt(e.target.value),
                    })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded mt-2"
                  value={editedBook?.description || ""}
                  onChange={(e) =>
                    setEditedBook({
                      ...editedBook!,
                      description: e.target.value,
                    })
                  }
                />

                <button
                  onClick={saveBookChanges}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Save Changes
                </button>
              </div>
            ) : selectedBook ? (
              // Display book details
              <div>
                <h2 className="text-2xl font-semibold">{selectedBook.title}</h2>
                <p className="text-gray-600">Author: {selectedBook.author}</p>
                <p className="text-gray-500">
                  Published: {selectedBook.publicationYear}
                </p>
                <p className="mt-4">{selectedBook.description}</p>

                {/* Insight in modal */}
                {aiInsights[selectedBook.id] && (
                  <p className="mt-4 p-3 bg-blue-100 text-blue-900 rounded-md shadow-md">
                    <strong>📖 AI Insight:</strong>{" "}
                    {aiInsights[selectedBook.id]}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500">No book selected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
