import React, { useEffect, useState } from "react";
import { Calculator, Scale, Ruler, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { bbtoolsService as defaultService, BBMetric, CreateBBMetricRequest } from "../../../services/BBToolsService";

interface BMICalculatorProps {
  service?: typeof defaultService; // optional prop to inject mock service
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ service = defaultService }) => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [bmi, setBmi] = useState<number | null>(null);

  const [savedMetrics, setSavedMetrics] = useState<BBMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.getAll();
        if (!mounted) return;
        if (!res.success) {
          setSavedMetrics([]);
          setLoading(false);
          return;
        }

        const metrics = res.data?.metrics ?? [];
        const bmiMetrics = metrics
          .filter((m: BBMetric) => m.title === "BMI")
          .sort((a: BBMetric, b: BBMetric) => {
            const da = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt || 0).getTime();
            const db = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt || 0).getTime();
            return db - da;
          });

        setSavedMetrics(bmiMetrics);

        if (bmiMetrics.length > 0) {
          const latest = bmiMetrics[0];
          try {
            if (latest.notes) {
              const parsed = JSON.parse(latest.notes);
              if (parsed.weight !== undefined) setWeight(String(parsed.weight));
              if (parsed.height !== undefined) setHeight(String(parsed.height));
              if (parsed.heightUnit) setHeightUnit(parsed.heightUnit);
              if (parsed.weightUnit) setWeightUnit(parsed.weightUnit);
            } else if (latest.unit) {
              const parts = latest.unit.split("/");
              if (parts[0]) setWeightUnit(parts[0]);
              if (parts[1]) setHeightUnit(parts[1]);
            }
            if (latest.value) {
              const num = parseFloat(latest.value);
              if (!isNaN(num)) setBmi(Number(num.toFixed(1)));
            }
          } catch (e) {
            console.warn("Failed to parse latest BMI metric notes", e);
          }
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError("Failed to load saved BMI data");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [service]);

  const calculateBMI = async () => {
    setError(null);
    if (!weight || !height) {
      setError("Please enter both weight and height");
      return;
    }

    let weightInKg = parseFloat(weight);
    let heightInMeters = parseFloat(height);

    if (isNaN(weightInKg) || isNaN(heightInMeters)) {
      setError("Invalid number entered");
      return;
    }

    if (weightUnit === "lbs") weightInKg *= 0.453592;

    if (heightUnit === "cm") heightInMeters /= 100;
    else if (heightUnit === "ft") {
      const feet = Math.floor(heightInMeters);
      const fractional = heightInMeters - feet;
      const inches = Math.round(fractional * 12);
      heightInMeters = feet * 0.3048 + inches * 0.0254;
    }

    if (heightInMeters <= 0) {
      setError("Height must be greater than zero");
      return;
    }

    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    const rounded = parseFloat(bmiValue.toFixed(1));
    setBmi(rounded);

    await saveMetricAuto(rounded);
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: "Underweight", trend: "down", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    if (bmiValue < 25) return { category: "Healthy Weight", trend: "stable", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (bmiValue < 30) return { category: "Overweight", trend: "up", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return { category: "Obese", trend: "up", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const getPregnancyRecommendation = (category: string) => {
    const recommendations: Record<string, string> = {
      Underweight: "Aim for 12.5-18 kg weight gain during pregnancy",
      "Healthy Weight": "Aim for 11.5-16 kg weight gain during pregnancy",
      Overweight: "Aim for 7-11.5 kg weight gain during pregnancy",
      Obese: "Aim for 5-9 kg weight gain during pregnancy"
    };
    return recommendations[category] ?? "";
  };

  const saveMetricAuto = async (bmiValue: number) => {
    setSaving(true);
    setError(null);
    try {
      const payload: CreateBBMetricRequest = {
        title: "BMI",
        value: String(bmiValue),
        unit: `${weightUnit}/${heightUnit}`,
        notes: JSON.stringify({ weight: Number(weight), height: Number(height), weightUnit, heightUnit }),
      };
      const res = await service.createMetric(payload);
      if (!res.success) return;
      setSavedMetrics(prev => [res.data, ...prev]);
    } catch (e) {
      console.error("Error saving BMI metric:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (metricId?: number) => {
    if (!metricId) return;
    setError(null);
    try {
      const res = await service.deleteMetric(String(metricId));
      if (!res.success) {
        setError(res.error ?? "Failed to delete saved BMI");
        return;
      }
      setSavedMetrics(prev => prev.filter(m => m.id !== metricId));
    } catch (e) {
      console.error(e);
      setError("Failed to delete saved BMI");
    }
  };

  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-bloomPink to-bloomYellow rounded-xl">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-bloomBlack">BMI Calculator</h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-pink-200 p-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Enter Your Measurements
            </h4>

            <div className="space-y-4">
              {/* Weight Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={weight}
                    min="0"
                    onKeyDown={(e) => e.key === "e" || e.key === "." || e.key === "-" && e.preventDefault()}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-bloomPink focus:border-transparent"
                    placeholder="Enter weight"
                    step="0.1"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-bloomPink focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              {/* Height Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={height}
                    min="0"
                    onKeyDown={(e) => e.key === "e" || e.key === "." || e.key === "-" && e.preventDefault()}
                    onChange={(e) => setHeight(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-bloomPink focus:border-transparent"
                    placeholder={heightUnit === "ft" ? "e.g., 5.6 for 5'6\"" : "Enter height"}
                    step="0.1"
                  />
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-bloomPink focus:border-transparent"
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
                {heightUnit === "ft" && (
                  <p className="text-sm text-gray-500 mt-1">Enter as feet.decimal (e.g., 5.6 for 5'6")</p>
                )}
              </div>

              <button
                onClick={calculateBMI}
                className="w-full bg-gradient-to-r from-bloomPink to-bloomYellow text-white py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate BMI
              </button>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              {saving && <p className="text-sm text-gray-600 mt-2">Saving BMI...</p>}
            </div>
          </div>

          {/* BMI Chart */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">BMI Categories</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-gray-700">Underweight</span>
                <span className="text-sm font-semibold text-yellow-600">Below 18.5</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Healthy Weight</span>
                <span className="text-sm font-semibold text-green-600">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-gray-700">Overweight</span>
                <span className="text-sm font-semibold text-orange-600">25 - 29.9</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Obese</span>
                <span className="text-sm font-semibold text-red-600">30 and above</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {bmi && bmiCategory && (
            <>
              <div className={`rounded-2xl p-6 border ${bmiCategory.bg} ${bmiCategory.border}`}>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-gray-800 mb-2">{bmi}</div>
                  <div className="text-lg text-gray-600">Body Mass Index</div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  {bmiCategory.trend === "up" && <TrendingUp className="w-5 h-5 text-orange-600" />}
                  {bmiCategory.trend === "down" && <TrendingDown className="w-5 h-5 text-yellow-600" />}
                  {bmiCategory.trend === "stable" && <Minus className="w-5 h-5 text-green-600" />}
                  <span className={`text-lg font-semibold ${bmiCategory.color}`}>
                    {bmiCategory.category}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 mt-4">
                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-bloomPink" />
                    Pregnancy Recommendation
                  </h5>
                  <p className="text-sm text-gray-700">
                    {getPregnancyRecommendation(bmiCategory.category)}
                  </p>
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">Healthy Pregnancy Tips</h4>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Eat balanced meals with plenty of fruits and vegetables</li>
                  <li>• Stay hydrated with 8-10 glasses of water daily</li>
                  <li>• Engage in moderate exercise like walking or prenatal yoga</li>
                  <li>• Attend all prenatal appointments</li>
                  <li>• Listen to your body's hunger and fullness cues</li>
                </ul>
              </div>
            </>
          )}

          {/* Empty State */}
          {!bmi && (
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
              <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-700 mb-2">Calculate Your BMI</h4>
              <p className="text-gray-500 text-sm">
                Enter your weight and height to see your BMI results and pregnancy recommendations.
              </p>
            </div>
          )}

          {/* Saved BMI History */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">Saved BMI Entries</h4>
              {loading ? <span className="text-sm text-gray-500">Loading...</span> : <span className="text-sm text-gray-500">{savedMetrics.length} saved</span>}
            </div>

            {savedMetrics.length === 0 && !loading && (
              <p className="text-sm text-gray-500">No saved BMI entries yet. Your results will be auto-saved when you calculate.</p>
            )}

            <ul className="space-y-3">
              {savedMetrics.map((m) => (
                <li key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="text-sm font-semibold">{m.value} BMI</div>
                    <div className="text-xs text-gray-500">
                      {m.unit ? `${m.unit}` : ""} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // restore saved metric to UI inputs if notes parseable
                        try {
                          if (m.notes) {
                            const parsed = JSON.parse(m.notes);
                            if (parsed.weight !== undefined) setWeight(String(parsed.weight));
                            if (parsed.height !== undefined) setHeight(String(parsed.height));
                            if (parsed.weightUnit) setWeightUnit(parsed.weightUnit);
                            if (parsed.heightUnit) setHeightUnit(parsed.heightUnit);
                          }
                          if (m.value) {
                            const num = parseFloat(m.value);
                            if (!isNaN(num)) setBmi(Number(num.toFixed(1)));
                          }
                        } catch (e) {
                          console.warn("Cannot restore metric", e);
                        }
                      }}
                      className="px-3 py-1 text-sm rounded-xl border hover:bg-gray-50"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-3 py-1 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BMICalculator;