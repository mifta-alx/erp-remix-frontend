import { Check, X } from "lucide-react";

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
                <Check className="text-white" size={16} strokeWidth={2} />
              </span>
            ) : // else if jika step sama dengan current step
            step === currentStep ? (
              // check apakah status failed
              status === "failed" ? (
                <span className="w-6 h-6 bg-red-500 custom-shadow-step-cancelled rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-8 lg:h-8 transition-all duration-500 ease-in-out">
                  <X className="text-white" size={16} strokeWidth={2} />
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
