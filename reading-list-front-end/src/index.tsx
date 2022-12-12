import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import { getBooks } from "./api/books/get-books";
import { Book } from "./api/books/types/book";
import groupBy from "lodash/groupBy";
import AddItem from "./components/modal/fragments/add-item";
import { deleteBooks } from "./api/books/delete-books";
import { BasicUserInfo, useAuthContext } from "@asgardeo/auth-react";
import { Dictionary } from "lodash";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [readList, setReadList] = useState<Dictionary<Book[]> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signOut, getAccessToken, isAuthenticated, getBasicUserInfo } =
    useAuthContext();
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<BasicUserInfo | null>(null);

  useEffect(() => {
    async function signInCheck() {
      const isSignedIn = await isAuthenticated();
      setSignedIn(isSignedIn);
      return isSignedIn;
    }
    signInCheck().then((res) => {
      if (res) {
        getReadingList();
        getUser();
      } else {
        console.log("User has not signed in");
      }
    });
  }, []);

  async function getUser() {
    setIsLoading(true);
    const userResponse = await getBasicUserInfo();
    setUser(userResponse);
    setIsLoading(false);
  }

  async function getReadingList() {
    setIsLoading(true);
    const accessToken = await getAccessToken();
    getBooks(accessToken)
      .then((res) => {
        const grouped = groupBy(res.data, (item) => item.status);
        setReadList(grouped);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  useEffect(() => {
    if (!isOpen) {
      getReadingList();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    const accessToken = await getAccessToken();
    setIsLoading(true);
    await deleteBooks(accessToken, id);
    getReadingList();
    setIsLoading(false);
  };

  if (!signedIn) {
    return (
      <button
        className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white"
        onClick={() => signIn()}
      >
        Login
      </button>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {user && (
        <>
          <p className="text-2xl text-white mb-3 font-bold">
            Hi {user.username}!
          </p>
          <button
            className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white"
            onClick={() => signOut()}
          >
            Logout
          </button>
        </>
      )}
      <div className="w-full max-w-lg px-2 py-16 sm:px-0 mb-20">
        <div className="flex justify-between">
          <p className="text-4xl text-white mb-3 font-bold">Reading List</p>
          <>
            <button
              className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white"
              onClick={() => setIsOpen(true)}
            >
              + Add New
            </button>
            <button
              className="float-right bg-black bg-opacity-20 p-2 rounded-md text-sm my-3 font-medium text-white"
              onClick={() => getReadingList()}
            >
              Refresh List
            </button>
          </>
        </div>
        {readList && (
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              {Object.keys(readList).map((val) => (
                <Tab
                  key={val}
                  className={({ selected }) =>
                    classNames(
                      "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white shadow"
                        : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  {val}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              {Object.values(readList).map((books: Book[], idx) => (
                <Tab.Panel
                  key={idx}
                  className={
                    isLoading
                      ? classNames(
                          "rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 animate-pulse"
                        )
                      : classNames(
                          "rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                        )
                  }
                >
                  <ul>
                    {books.map((book) => (
                      <div className="flex justify-between">
                        <li key={book.id} className="relative rounded-md p-3">
                          <h3 className="text-sm font-medium leading-5">
                            {book.name}
                          </h3>

                          <ul className="mt-1 flex space-x-1 text-xs font-normal leading-4 text-gray-500">
                            <li>{book.author}</li>
                            <li>&middot;</li>
                          </ul>
                        </li>
                        <button
                          className="float-right bg-red-500 text-white rounded-md self-center text-xs p-2 mr-2"
                          onClick={() => handleDelete(book.id!)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </ul>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        )}
        <AddItem isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </div>
  );
}
