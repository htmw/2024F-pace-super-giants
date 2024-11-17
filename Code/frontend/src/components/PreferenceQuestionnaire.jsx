import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  AlertCircle,
  Leaf,
  Flame,
  DollarSign,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const PreferenceQuestionnaire = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [],
    spicePreference: "",
    priceRange: "",
    favoriteCategories: [],
    mealTiming: [],
    allergies: [],
    specialOccasions: false,
  });

  const questions = [
    {
      id: "dietary",
      title: "Any dietary restrictions?",
      subtitle: "Select all that apply",
      type: "multiSelect",
      options: [
        {
          value: "vegetarian",
          label: "Vegetarian",
          icon: <Leaf className="w-5 h-5" />,
        },
        { value: "vegan", label: "Vegan", icon: <Leaf className="w-5 h-5" /> },
        {
          value: "halal",
          label: "Halal",
          icon: <UtensilsCrossed className="w-5 h-5" />,
        },
        {
          value: "kosher",
          label: "Kosher",
          icon: <UtensilsCrossed className="w-5 h-5" />,
        },
        {
          value: "none",
          label: "No restrictions",
          icon: <Heart className="w-5 h-5" />,
        },
      ],
      field: "dietaryRestrictions",
    },
    {
      id: "spice",
      title: "How spicy do you like your food?",
      subtitle: "Select your preferred spice level",
      type: "singleSelect",
      options: [
        { value: "mild", label: "Mild", icon: <Flame className="w-5 h-5" /> },
        {
          value: "medium",
          label: "Medium",
          icon: <Flame className="w-5 h-5" />,
        },
        { value: "hot", label: "Hot", icon: <Flame className="w-5 h-5" /> },
        {
          value: "extra-hot",
          label: "Extra Hot",
          icon: <Flame className="w-5 h-5" />,
        },
      ],
      field: "spicePreference",
    },
    {
      id: "price",
      title: "What's your preferred price range?",
      subtitle: "Select your usual dining budget",
      type: "singleSelect",
      options: [
        {
          value: "budget",
          label: "Budget Friendly ($)",
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          value: "moderate",
          label: "Moderate ($$)",
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          value: "premium",
          label: "Premium ($$$)",
          icon: <DollarSign className="w-5 h-5" />,
        },
        {
          value: "luxury",
          label: "Luxury ($$$$)",
          icon: <DollarSign className="w-5 h-5" />,
        },
      ],
      field: "priceRange",
    },
    {
      id: "categories",
      title: "What types of cuisine do you enjoy?",
      subtitle: "Select all that apply",
      type: "multiSelect",
      options: [
        { value: "italian", label: "Italian" },
        { value: "chinese", label: "Chinese" },
        { value: "japanese", label: "Japanese" },
        { value: "indian", label: "Indian" },
        { value: "mexican", label: "Mexican" },
        { value: "mediterranean", label: "Mediterranean" },
        { value: "american", label: "American" },
        { value: "thai", label: "Thai" },
      ],
      field: "favoriteCategories",
    },
    {
      id: "timing",
      title: "When do you usually dine out?",
      subtitle: "Select all that apply",
      type: "multiSelect",
      options: [
        {
          value: "breakfast",
          label: "Breakfast",
          icon: <Clock className="w-5 h-5" />,
        },
        { value: "lunch", label: "Lunch", icon: <Clock className="w-5 h-5" /> },
        {
          value: "dinner",
          label: "Dinner",
          icon: <Clock className="w-5 h-5" />,
        },
        {
          value: "late-night",
          label: "Late Night",
          icon: <Clock className="w-5 h-5" />,
        },
      ],
      field: "mealTiming",
    },
    {
      id: "allergies",
      title: "Do you have any allergies?",
      subtitle: "Select all that apply",
      type: "multiSelect",
      options: [
        {
          value: "nuts",
          label: "Nuts",
          icon: <AlertCircle className="w-5 h-5" />,
        },
        {
          value: "dairy",
          label: "Dairy",
          icon: <AlertCircle className="w-5 h-5" />,
        },
        {
          value: "shellfish",
          label: "Shellfish",
          icon: <AlertCircle className="w-5 h-5" />,
        },
        {
          value: "gluten",
          label: "Gluten",
          icon: <AlertCircle className="w-5 h-5" />,
        },
        {
          value: "eggs",
          label: "Eggs",
          icon: <AlertCircle className="w-5 h-5" />,
        },
        {
          value: "none",
          label: "No allergies",
          icon: <Heart className="w-5 h-5" />,
        },
      ],
      field: "allergies",
    },
  ];

  const handleSelectOption = (field, value, isMulti) => {
    if (isMulti) {
      setPreferences((prev) => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      }));
    } else {
      setPreferences((prev) => ({ ...prev, [field]: value }));
      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      await setDoc(
        doc(collection(db, "users", user.uid, "preferences"), "default"),
        {
          ...preferences,
          updatedAt: new Date().toISOString(),
        },
      );

      await updateDoc(doc(db, "users", user.uid), {
        preferencesCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      navigate("/Udashboard");
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferencesCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      navigate("/Udashboard");
    } catch (err) {
      console.error("Error skipping preferences:", err);
      setError("Failed to skip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#F6F0E4] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 font-['Arvo']">{error}</p>
          </div>
        )}

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#990001] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-['Arvo']">
            {currentQuestion.title}
          </h2>
          <p className="text-gray-600 mb-6 font-['Arvo']">
            {currentQuestion.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleSelectOption(
                    currentQuestion.field,
                    option.value,
                    currentQuestion.type === "multiSelect",
                  )
                }
                disabled={loading}
                className={`
                  flex items-center p-4 rounded-lg border-2 transition-all
                  ${
                    preferences[currentQuestion.field]?.includes(
                      option.value,
                    ) || preferences[currentQuestion.field] === option.value
                      ? "border-[#990001] bg-[#990001] bg-opacity-10"
                      : "border-gray-200 hover:border-[#990001]"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {option.icon && <span className="mr-3">{option.icon}</span>}
                <span className="font-['Arvo']">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 0 || loading}
              className={`px-6 py-2 rounded-md font-['Arvo'] ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-[#990001] border border-[#990001] hover:bg-[#990001] hover:text-white"
              }`}
            >
              Previous
            </button>

            {currentStep === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Complete"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={loading}
                className="px-6 py-2 bg-[#990001] text-white rounded-md hover:bg-[#800001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="text-gray-500 hover:text-[#990001] font-['Arvo'] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Skip for now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceQuestionnaire;
