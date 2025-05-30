import { useState } from "react";
import { Input } from "../components/Input";
import Button from "../components/Button";
import { Textarea } from "../components/Textarea";
import { Plus } from "lucide-react";

export default function SellProductsPage() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-6">Sell Information</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 flex items-center justify-center text-sm">
              <span>adjust cover</span>
            </div>
            <Button className="w-full" mode="primary" text="Pricing" />
            <Button className="w-full" mode="primary" text="Quantity" />
            <Button className="w-full" mode="primary" text="Comment" />
            <Button className="w-full" mode="primary" text="Rating" />
            <Button className="w-full" mode="primary" text="Location" />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block font-semibold mb-1">Product’s Name</label>
              <Input
                maxLength={30}
                value={productName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProductName(e.target.value)
                }
                placeholder="Enter product name"
              />
              <div className="text-right text-xs text-gray-500">
                {productName.length}/30
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Describe your Products with and or videos
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gray-100 border flex items-center justify-center">
                  <span className="text-sm">Image</span>
                </div>
                <div className="aspect-square border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer">
                  <div className="flex flex-col items-center text-sm text-gray-500">
                    <Plus className="w-6 h-6" />
                    <span>Add picture & video</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <Textarea
                rows={4}
                maxLength={300}
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                placeholder="Enter product description"
              />
              <div className="text-right text-xs text-gray-500">
                {description.length}/300
              </div>
            </div>

            <Button className="w-full mt-4" mode="primary" text="SAVE" />
          </div>
        </div>
      </div>
    </div>
  );
}
