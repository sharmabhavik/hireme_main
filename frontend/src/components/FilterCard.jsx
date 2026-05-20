import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setJobFilters } from "@/redux/jobSlice";

const fitlerData = [
  {
    fitlerType: "Location",
    array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"],
  },
  {
    fitlerType: "Industry",
    array: ["Frontend Developer", "Backend Developer", "Full Stack Developer"],
  },
  {
    fitlerType: "Salary",
    array: ["0-5 LPA", "5-10 LPA", "10-20 LPA", "20+ LPA"],
  },
];

const FilterCard = () => {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setJobFilters({
        location: selectedLocation,
        industry: selectedIndustry,
        salaryRange: selectedSalary,
      }),
    );
  }, [selectedLocation, selectedIndustry, selectedSalary, dispatch]);

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-lg text-slate-900">Refine results</h2>
      <p className="mt-1 text-xs text-slate-500">
        Narrow listings by one option at a time.
      </p>
      <hr className="my-4 border-slate-100" />
      {fitlerData.map((data, index) => {
        const currentValue =
          data.fitlerType === "Location"
            ? selectedLocation
            : data.fitlerType === "Industry"
              ? selectedIndustry
              : selectedSalary;

        const onChange = (value) => {
          if (data.fitlerType === "Location") setSelectedLocation(value);
          if (data.fitlerType === "Industry") setSelectedIndustry(value);
          if (data.fitlerType === "Salary") setSelectedSalary(value);
        };

        return (
          <div key={data.fitlerType} className="mb-6 last:mb-0">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">
              {data.fitlerType}
            </h3>
            <RadioGroup value={currentValue} onValueChange={onChange}>
              {data.array.map((item, idx) => {
                const itemId = `id${index}-${idx}`;
                return (
                  <div
                    key={itemId}
                    className="flex items-center space-x-2 my-2.5"
                  >
                    <RadioGroupItem value={item} id={itemId} />
                    <Label
                      htmlFor={itemId}
                      className="cursor-pointer text-sm font-normal text-slate-700"
                    >
                      {item}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );
      })}
    </div>
  );
};

export default FilterCard;
