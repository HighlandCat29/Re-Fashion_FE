import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Upload,
  message,
} from "antd";
// ... existing code ...
const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  // ... existing code ...
};
