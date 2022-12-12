import React, { useState } from "react";
import { postBooks } from "../../../api/books/post-books";
import { Book } from "../../../api/books/types/book";
import Modal from "../modal";
import { useAuthContext } from "@asgardeo/auth-react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

export interface ShareListProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShareList(props: ShareListProps) {
  const { isOpen, setIsOpen } = props;
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const { getAccessToken } = useAuthContext();

  const handleOnSubmit = () => {
    async function setBooks() {
      const accessToken = await getAccessToken();
      const payload: Book = {
        title: name,
        author: author,
      };
      const response = await postBooks(accessToken, payload);
      setIsOpen(false);
      console.log(response);
    }
    setBooks();
  };

  const innerFragment = (
    <div className="mt-2">
      <p>This feature is not available yet.</p>
      {/* <form className="bg-white rounded pt-2 pb-1">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Author
          </label>
          <input
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="author"
            type="text"
            placeholder="Author"
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Status
          </label>
        </div>
      </form> */}
    </div>
  );
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Share List"
      children={innerFragment}
      handleSubmit={handleOnSubmit}
      isDisabled={!(name && author)}
    />
  );
}
