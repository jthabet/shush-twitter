import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { create } from "zustand";

interface BearerState {
  bearerToken: string | null;
  setBearerToken: (token: string | null) => void;
}

const useBearerStore = create<BearerState>((set) => ({
  bearerToken: null,
  setBearerToken: (token) => set(() => ({ bearerToken: token })),
}));

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find root element");
const root = createRoot(rootElement);
root.render(
  <div className="mx-auto mt-10 grid grid-flow-row auto-rows-max justify-items-center">
    <TokenForm />
  </div>
);

type FormInput = {
  token: string;
};

function TokenForm() {
  const { bearerToken, setBearerToken } = useBearerStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput>();
  const onSubmit: SubmitHandler<FormInput> = (data) => {
    console.log(data);
    if (data.token) {
      chrome.storage.local
        .set({ bearer: data.token })
        .then(() => {
          setBearerToken(data.token);
          // window.close();
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit(onSubmit)} className="" id="myForm">
        <input
          className=" w-72 rounded-md border border-slate-300 bg-inherit py-2 text-slate-800 shadow-sm placeholder:text-center placeholder:italic placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-900 disabled:shadow-none dark:bg-white sm:text-sm"
          placeholder="add bearer token"
          id="token"
          {...register("token")}
        />

        <input
          className="ml-4 rounded-full bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm  hover:bg-blue-300 focus:ring focus:ring-blue-300 active:bg-blue-700"
          type="submit"
        />
      </form>
      <IsConfigured />
      <div className="space-x-4">
        <CustomButton
          onClick={() => {
            chrome.storage.local
              .remove("bearer")
              .then(() => setBearerToken(""))
              .catch((err) => console.error(err));
          }}
        >
          Clear
        </CustomButton>
      </div>
    </div>
  );
}

function IsConfigured() {
  const { bearerToken, setBearerToken } = useBearerStore();
  useEffect(() => {
    chrome.storage.local
      .get(["bearer"])
      .then((result) => {
        const bearerToken = result.bearer;
        setBearerToken(bearerToken);
      })
      .catch((error) => {
        console.error("Error retrieving token:", error);
      });
  }, [setBearerToken]);

  return (
    <p className="mt-3 dark:text-white">{bearerToken ? "true" : "false"}</p>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

const CustomButton: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button
    className="rounded-full bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm  hover:bg-blue-300 focus:ring focus:ring-blue-200 active:bg-blue-700"
    {...props}
  >
    {children}
  </button>
);
