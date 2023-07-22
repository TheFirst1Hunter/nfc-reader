import React, { useState } from "react";

const CardType = ({ setter }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="text-white bg-green-700 gap-2 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        type="button"
      >
        اختر نوع البطاقة
        <svg
          class="w-2.5 h-2.5 ml-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>
      <div
        id="dropdown"
        className={`
          "z-10  bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${
            isOpen ? "hidden" : ""
          }`}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          <button
            className="w-full flex justify-center"
            onClick={() => {
              setter("newCard");
            }}
          >
            البطاقة الجديدة
          </button>
          <button
            className="w-full flex justify-center"
            onClick={() => setter("oldCard")}
          >
            البطاقة القديمة
          </button>
        </ul>
      </div>
    </div>
  );
};

export default CardType;
