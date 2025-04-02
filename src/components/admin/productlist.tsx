import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";
import { IProduct } from "../../interface/product";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import { Button, message, Popconfirm, Table } from "antd";
import {DeleteFilled, EditFilled, WarningFilled} from '@ant-design/icons'
const ProductList = () => {
  const { data, isLoading } = useQuery<IProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data: products } = await api.get("products");
        return products;
      } catch (error) {
        return [];
      }
    },
  });
  const navigate= useNavigate()
  const queryclient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await axios.delete(`http://localhost:4000/products/${id}`);
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
        message.success("Xóa thành công")
      queryclient.invalidateQueries({ queryKey: ["products"] });
    },
  });
  if (isLoading) {
    return <>Đang tải dữ liệu</>;
  }

  const DelProduct = (id: number) => {
    // if (confirm("Bạn chắc chứ?")) {
      mutation.mutate(id);
    // }
  };
  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_:any,__:any,index:number)=>index+1
    },
    {
      title: "Ảnh sản phẩm",
      dataIndex: "images",
      key: "images",
      render: (image:string)=><img src={image} width={90}/>
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá sản phẩm",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "action",
      render: (id:number)=><>
        <Button className="mr-2" type="primary" onClick={()=>navigate(`/dashboard/product-edit/${id}`)}><EditFilled /> Sửa</Button>
        <Popconfirm
            title="Thông báo"
            icon = {<WarningFilled />}
            description="Bạn thực sự muốn xóa sản phẩm này?"
            onConfirm={()=>DelProduct(id)}
            okText="Đồng ý xóa"
            cancelText="Hủy"
        >
            <Button danger><DeleteFilled /> Xóa</Button>
        </Popconfirm>
      </>
    },
  ];
  return (
    <div>
      <h1 className="text-[2rem] text-center mb-5">Danh sách sản phẩm</h1>
      {(data)&&<Table dataSource={data} columns={columns} rowKey={(data)=>data.id}/>}
    </div>
  );
};

export default ProductList;
