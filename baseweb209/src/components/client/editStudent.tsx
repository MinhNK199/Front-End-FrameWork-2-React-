import { useForm } from "react-hook-form";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

interface IStudent {
  name: string;
  class: string;
  age: number;
  hometown: string;
}

const EditStudent = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IStudent>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch dữ liệu sinh viên theo ID
  const { data: student, isLoading } = useQuery<IStudent>({
    queryKey: ["student", id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3000/students/${id}`);
      reset(response.data);
      return response.data;
    }

  });

  const mutation = useMutation({
    mutationFn: async (updatedStudent: IStudent) => {
      await axios.put(`http://localhost:3000/students/${id}`, updatedStudent);
    },
    onSuccess: () => {
      alert("Cập nhật sinh viên thành công!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      navigate("/student");
    },
  });

  const onSubmit = (data: IStudent) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  return (
    <div className="form-container">
      <h1 className="text-[2-rem] text-center font-bold my-5">Chỉnh Sửa Sinh Viên</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md mx-auto">

        <div>
          <label>Họ Tên</label>
          <input
            {...register("name", { required: "Họ tên không được để trống." })}
            placeholder="Nhập họ tên"
            className="border rounded p-2 w-full"
          />
          {errors.name && <span className="text-red-500">{errors.name.message}</span>}
        </div>


        <div>
          <label>Lớp</label>
          <input
            {...register("class", { required: "Lớp không được để trống." })}
            placeholder="Nhập lớp"
            className="border rounded p-2 w-full"
          />
          {errors.class && <span className="text-red-500">{errors.class.message}</span>}
        </div>


        <div>
          <label>Tuổi</label>
          <input
            type="number"
            {...register("age", {
              required: "Tuổi không được để trống.",
              min: { value: 10, message: "Tuổi phải lớn hơn hoặc bằng 10." },
              max: { value: 100, message: "Tuổi phải nhỏ hơn hoặc bằng 100." },
            })}
            placeholder="Nhập tuổi"
            className="border rounded p-2 w-full"
          />
          {errors.age && <span className="text-red-500">{errors.age.message}</span>}
        </div>


        <div>
          <label>Quê Quán</label>
          <input
            {...register("hometown", { required: "Quê quán không được để trống." })}
            placeholder="Nhập quê quán"
            className="border rounded p-2 w-full"
          />
          {errors.hometown && <span className="text-red-500">{errors.hometown.message}</span>}
        </div>

        <button type="submit" className="bg-green-500 text-white rounded py-2 px-4 hover:bg-green-700">
          Cập Nhật
        </button>
      </form>
    </div>
  );
};

export default EditStudent;
