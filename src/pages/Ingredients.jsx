import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import translations from "../translations";
import { useLang } from "../context/LangContext";

const API = "http://localhost:8080/api/ingredients";

export default function Ingredients() {
  const { lang } = useLang();
  const t = (key) => translations[lang]?.Ingredients?.[key] || key;

  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    ingredientName: "",
    unit: "",
    stockQty: 0,
    minStockLevel: 0,
    costPerUnit: 0,
    supplierName: ""
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setIngredients(data);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      ingredientName: "",
      unit: "",
      stockQty: "",
      minStockLevel: "",
      costPerUnit: "",
      supplierName: ""
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item.ingredientId);
    setForm(item);
    setShowModal(true);
  };

  const saveIngredient = async () => {
    if (!form.ingredientName) {
      alert(t("IngredientNameRequired"));
      return;
    }

    if (editing) {
      await fetch(`${API}/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    }

    setShowModal(false);
    fetchIngredients();
  };

  const deleteIngredient = async (id) => {
    if (!confirm(t("DeleteIngredientConfirm"))) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE"
    });

    fetchIngredients();
  };

  const getStockStatus = (item) => {
    if (item.stockQty === 0) return "bg-red-100 text-red-700";
    if (item.stockQty <= item.minStockLevel) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("AddIngredient")}</h1>

        <button
          onClick={openAdd}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex gap-2"
        >
          <Plus size={18} /> {t("AddIngredient")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">{t("Name")}</th>
              <th className="p-3 text-left">{t("Unit")}</th>
              <th className="p-3 text-left">{t("Stock")}</th>
              <th className="p-3 text-left">{t("MinStock")}</th>
              <th className="p-3 text-left">{t("costPerUnit")}</th>
              <th className="p-3 text-left">{t("Supplier")}</th>
              <th className="p-3 text-left">{t("Status")}</th>
              <th className="p-3 text-left">{t("Action")}</th>
            </tr>
          </thead>

          <tbody>
            {ingredients.map((item) => (
              <tr key={item.ingredientId} className="border-t">
                <td className="p-3">{item.ingredientName}</td>
                <td className="p-3">{item.unit}</td>
                <td className="p-3">{item.stockQty}</td>
                <td className="p-3">{item.minStockLevel}</td>
                <td className="p-3">{item.costPerUnit}</td>
                <td className="p-3">{item.supplierName}</td>

                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStockStatus(item)}`}>
                    {item.stockQty === 0
                      ? t("OutOfStock")
                      : item.stockQty <= item.minStockLevel
                      ? t("Low")
                      : t("OK")}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => deleteIngredient(item.ingredientId)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold">
                {editing ? t("EditIngredient") : t("AddIngredient")}
              </h2>

              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <p className="font-black">{t("IngredientsName")}</p>
            <input
              className="w-full border p-2 rounded"
              placeholder={t("IngredientsName")}
              value={form.ingredientName}
              onChange={(e) =>
                setForm({ ...form, ingredientName: e.target.value })
              }
            />

            <p className="font-black">{t("Unit")}</p>
            <input
              className="w-full border p-2 rounded"
              placeholder={t("Unit")}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />

            <p className="font-black">{t("Stock")}</p>
            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder={t("Stock")}
              value={form.stockQty}
              onChange={(e) =>
                setForm({ ...form, stockQty: e.target.value })
              }
            />

            <p className="font-black">{t("MinStock")}</p>
            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder={t("MinStock")}
              value={form.minStockLevel}
              onChange={(e) =>
                setForm({ ...form, minStockLevel: e.target.value })
              }
            />

            <p className="font-black">{t("costPerUnit")}</p>
            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder={t("costPerUnit")}
              value={form.costPerUnit}
              onChange={(e) =>
                setForm({ ...form, costPerUnit: e.target.value })
              }
            />

            <p className="font-black">{t("Supplier")}</p>
            <input
              className="w-full border p-2 rounded"
              placeholder={t("Supplier")}
              value={form.supplierName}
              onChange={(e) =>
                setForm({ ...form, supplierName: e.target.value })
              }
            />

            <button
              onClick={saveIngredient}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg"
            >
              {t("Save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}