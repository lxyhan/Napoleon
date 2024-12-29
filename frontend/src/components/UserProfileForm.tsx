'use client';

import React, { useState, useEffect } from "react";
import { Transition } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'

const API_BASE_URL = "http://localhost:3400/profile/";

const fetchProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error(`Error fetching profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

const saveProfile = async (profileData: { username: string; about: string; short_term_goals: string; medium_term_goals: string; long_term_goals: string; }) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error(`Error saving profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default function Example() {
  const [profile, setProfile] = useState({
    username: "",
    about: "",
    short_term_goals: "",
    medium_term_goals: "",
    long_term_goals: ""
  });
  const [showAlert, setShowAlert] = useState(false); // Controls visibility of the alert
  const [alertMessage, setAlertMessage] = useState(""); // Message inside the alert
  const [alertType, setAlertType] = useState("success"); // "success" or "error"

  // Fetch profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchProfile();
      if (data) {
        setProfile(data);
      }
    };
    loadProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const updatedProfile = await saveProfile(profile);
      setProfile(updatedProfile); // Update the state with the latest data
      setAlertMessage("Profile saved successfully!"); // Success message
      setAlertType("success"); // Set type to success
      setShowAlert(true); // Show alert
    } catch (error) {
      setAlertMessage("Failed to save profile. Please try again."); // Error message
      setAlertType("error"); // Set type to error
      setShowAlert(true); // Show alert
    }
  };
  

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12 sm:space-y-16">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900">Profile</h2>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">
              Context for GPT Model
            </p>

            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
                >
                  Your Name
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:max-w-md">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="janesmith"
                      value={profile.username}
                      onChange={handleChange}
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="about"
                  className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
                >
                  About Yourself
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    value={profile.about}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-2xl sm:text-sm/6"
                  />
                  <p className="mt-3 text-sm/6 text-gray-600">
                    Write a few sentences about yourself (Classes, Interests, Personality, Age...)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base/7 font-semibold text-gray-900">
              Personal Information
            </h2>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">
              What are your medium-term goals?
            </p>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="short_term_goals"
                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
              >
                Weekly Goals
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <textarea
                  id="short_term_goals"
                  name="short_term_goals"
                  rows={3}
                  value={profile.short_term_goals}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-2xl sm:text-sm/6"
                />
                <p className="mt-3 text-sm/6 text-gray-600">
                  Describe your weekly goals (Assignments, Applications...)
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="medium_term_goals"
                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
              >
                Monthly Goals
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <textarea
                  id="medium_term_goals"
                  name="medium_term_goals"
                  rows={3}
                  value={profile.medium_term_goals}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-2xl sm:text-sm/6"
                />
                <p className="mt-3 text-sm/6 text-gray-600">
                  Describe your Monthly goals (Projects, Exams...)
                </p>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="long_term_goals"
                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
              >
                Semester Goals
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <textarea
                  id="long_term_goals"
                  name="long_term_goals"
                  rows={3}
                  value={profile.long_term_goals}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-2xl sm:text-sm/6"
                />
                <p className="mt-3 text-sm/6 text-gray-600">
                  Describe your Semester goals (Fitness, Grades, Internships...)
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900"
            onClick={() => setProfile({ username: "", about: "", short_term_goals: "", medium_term_goals: "", long_term_goals: "" })}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Save
          </button>
        </div>
      </form>

      {/* Success Modal */}


      {showAlert && (
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={showAlert}
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
            enterTo="opacity-100 translate-y-0 sm:translate-x-0"
            leave="transition ease-in duration-100 transform"
            leaveFrom="opacity-100 translate-y-0 sm:translate-x-0"
            leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
          >
            <div
              className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <svg
                      className={`h-6 w-6 ${
                        alertType === "success" ? "text-green-400" : "text-red-400"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          alertType === "success"
                            ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M6 18L18 6M6 6l12 12"
                        }
                      />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{alertMessage}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {alertType === "success"
                        ? "Your changes have been successfully saved."
                        : "An error occurred. Please try again."}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShowAlert(false)} // Hide alert on click
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    )}

    </div>
  );
}
