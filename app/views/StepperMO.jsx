import { Check, X } from "@phosphor-icons/react/dist/ssr";

const StepperMO = ({ currentStep = 1, status = "process" }) => {
  const steps = {
    1: { label: "Draft" },
    2: { label: "Confirmed" },
    3: { label: "Check Availability" },
    4: { label: "In Progress" },
    5: { label: "Done" },
  };

  // Konversi steps ke array untuk iterasi
  const stepKeys = Object.keys(steps).map(Number);

  return (
    <ol className="flex items-center md:w-3/4 mx-auto text-sm text-gray-500 sm:text-base">
      {stepKeys.map((step) => (
        <li
          key={step}
          className={`flex relative ${
            step < stepKeys.length
              ? `w-full after:w-full lg:after:w-7/12 xl:after:w-3/4 after:h-0.5 ${
                  step < currentStep ||
                  (step === currentStep && status === "success")
                    ? "after:bg-primary-500"
                    : "after:bg-gray-200 dark:after:bg-gray-600"
                } after:inline-block after:absolute lg:after:top-4 after:top-3 after:left-5 md:after:left-5 lg:after:left-[30%] xl:after:left-[20%]`
              : ""
          }`}
        >
          <div className="block relative whitespace-nowrap z-10">
            {/*cek if step kurang dari current step, dan step sama dengan current step dengan status success*/}
            {step < currentStep ||
            (step === currentStep && status === "success") ? (
              <span className="w-6 h-6 bg-primary-500 dark:bg-primary-600 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8 transition-all duration-500 ease-in-out">
                <Check className="w-4 h-4 text-white" weight="bold" />
              </span>
            ) : // else if jika step sama dengan current step
            step === currentStep ? (
              // check apakah status failed
              status === "failed" ? (
                <span className="w-6 h-6 bg-red-500 custom-shadow-step-cancelled rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8 transition-all duration-500 ease-in-out">
                  <X className="w-4 h-4 text-white" weight="bold" />
                </span>
              ) : (
                <span className="w-6 h-6 bg-primary-500 dark:bg-primary-600 custom-shadow-step rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8 transition-all duration-500 ease-in-out">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </span>
              )
            ) : (
              // else step masih lebih dari current step
              <span className="w-6 h-6 bg-gray-100 dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-700 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8 transition-all duration-500 ease-in-out">
                <div className="w-2.5 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </span>
            )}

            <p
              className={`text-xs ${
                step < currentStep ||
                (step === currentStep && status === "success")
                  ? "text-primary-400 dark:text-primary-500"
                  : step === currentStep
                  ? status === "failed"
                    ? "text-red-500 font-medium"
                    : "text-primary-500 dark:text-primary-400 font-medium"
                  : "text-gray-400 dark:text-gray-500 font-normal"
              } text-center whitespace-normal lg:whitespace-nowrap absolute left-1/2 transform -translate-x-1/2`}
            >
              {steps[step].label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default StepperMO;

// import { Check } from "@phosphor-icons/react/dist/ssr";
//
// const StepperMO = ({ state }) => {
//   const stepperProcess = [
//     {
//       state: 1,
//       label: "Draft",
//     },
//     {
//       state: 2,
//       label: "To Do",
//     },
//     {
//       state: 3,
//       label: "Check Availability",
//     },
//     {
//       state: 4,
//       label: "On Progress",
//     },
//     {
//       state: 5,
//       label: state === 0 ? "Cancelled" : "Done",
//     },
//   ];
//
//   return (
//     <ol className="flex items-center md:w-3/4 mx-auto text-sm text-gray-500 sm:text-base">
//       {stepperProcess.map((step, index) => (
//         <li
//           key={index}
//           className={`flex relative ${
//             index < stepperProcess.length - 1
//               ? ` w-full after:w-full lg:after:w-7/12 xl:after:w-3/4 after:h-0.5 ${
//                   state === 0
//                     ? "after:bg-red-500"
//                     : step.state <= state - 1
//                     ? "after:bg-primary-500"
//                     : "after:bg-slate-200"
//                 } after:inline-block after:absolute lg:after:top-4 after:top-3 after:left-5 md:after:left-5 lg:after:left-[30%] xl:after:left-[20%]`
//               : ""
//           }`}
//         >
//           <div className="block relative whitespace-nowrap z-10">
//             {state === 0 || step.state <= state ? (
//               <span
//                 className={`w-6 h-6 ${
//                   state === 0
//                     ? "bg-red-500 custom-shadow-step-cancelled"
//                     : step.state < state
//                     ? "bg-primary-500"
//                     : "bg-primary-500 custom-shadow-step"
//                 } rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8`}
//               >
//                 {step.state < state && state !== 0 ? (
//                   <Check className="w-4 h-4 text-white" weight="bold" />
//                 ) : (
//                   <div className="w-2.5 h-2.5 bg-white rounded-full" />
//                 )}
//               </span>
//             ) : (
//               <span className="w-6 h-6 bg-slate-100 border-2 border-gray-200 dark:border-gray-700 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8">
//                 <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
//               </span>
//             )}
//             <p
//               className={`text-xs ${
//                 state === 0 || step.state <= state
//                   ? state === 0
//                     ? "text-red-500 font-medium"
//                     : "text-primary-500 font-medium"
//                   : "text-gray-400 dark:border-gray-700 font-normal"
//               } text-center whitespace-normal lg:whitespace-nowrap absolute left-1/2 transform -translate-x-1/2`}
//             >
//               {step.label}
//             </p>
//           </div>
//         </li>
//       ))}
//     </ol>
//   );
// };
//
// export default StepperMO;
