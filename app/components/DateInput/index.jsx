"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import getDaysInMonth from "@/utils/getDaysInMonth";
import { formatDate } from "@utils/formatDate.js";
import useClickOutside from "@/hooks/useClickOutside";
import DateInputPopup from "./DateInputPopup";
import DateItem from "./DateItem";
import { CalendarBlank } from "@phosphor-icons/react";

function getDateSlots(currentMonth, currentYear) {
  const dateArray = getDaysInMonth(currentMonth, currentYear);
  const slotSkipCount = new Date(dateArray[0]).getDay();

  for (let i = 0; i < slotSkipCount; i++) {
    dateArray.unshift(null);
  }

  return dateArray;
}

const DateInput = ({ value, onChange, actionButton = false }) => {
  const popupRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [typingTimeout, setTypingTimeout] = useState(null);

  useClickOutside(popupRef, () => {
    setShowPopup(false);
  });

  const dateArray = useMemo(
    () => getDateSlots(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);

      setSelectedDate(formatDate(dateObj));
      setCurrentMonth(dateObj.getMonth());
      setCurrentYear(dateObj.getFullYear());
    }
  }, [value]);

  function togglePopupHandler() {
    setShowPopup((currentShowPopup) => {
      return !currentShowPopup;
    });
  }

  function navigateMonthHandler(navigateBy = 1) {
    if (currentMonth + navigateBy === 12) {
      setCurrentMonth(0);
      setCurrentYear((currentState) => {
        return currentState + 1;
      });
    } else if (currentMonth + navigateBy === -1) {
      setCurrentMonth(11);
      setCurrentYear((currentState) => {
        return currentState - 1;
      });
    } else {
      setCurrentMonth((currentState) => {
        return currentState + navigateBy;
      });
    }
  }

  function selectDateHandler(date) {
    const now = new Date();

    date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    onChange(date.toISOString());
    setSelectedDate(formatDate(date));
    setShowPopup(false);
  }

  function clearDate() {
    setSelectedDate(null);
  }

  function dateToday() {
    setShowPopup(false);
    setSelectedDate(formatDate(new Date()));
  }

  function handleInputChange(event) {
    const inputValue = event.target.value;
    setSelectedDate(inputValue);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        const parsedDate = new Date(inputValue);
        if (!isNaN(parsedDate) && inputValue === formatDate(parsedDate)) {
          onChange(parsedDate);
          setCurrentMonth(parsedDate.getMonth());
          setCurrentYear(parsedDate.getFullYear());
        }
      }, 1000)
    );
  }

  return (
    <span ref={popupRef}>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500 dark:text-gray-400">
          <CalendarBlank size={16} weight="bold" />
        </div>
        <input
          value={selectedDate}
          onChange={handleInputChange}
          onFocus={togglePopupHandler}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Select date"
        />

        {showPopup && (
          <DateInputPopup
            currentMonth={currentMonth}
            currentYear={currentYear}
            navigateMonth={navigateMonthHandler}
            clearDate={clearDate}
            dateToday={dateToday}
            actionButton={actionButton}
          >
            {dateArray.map((dateObj, index) => {
              return (
                <DateItem
                  key={index}
                  dateObj={dateObj.date}
                  isFromPreviousMonth={dateObj.isFromPreviousMonth}
                  isFromNextMonth={dateObj.isFromNextMonth}
                  selected={selectedDate === formatDate(dateObj.date)}
                  onClick={() => selectDateHandler(dateObj.date)}
                />
              );
            })}
          </DateInputPopup>
        )}
      </div>
    </span>
  );
};

export default DateInput;