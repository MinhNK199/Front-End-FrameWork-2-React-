
import { useForm } from "react-hook-form";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface IStudent {
  name: string;
  class: string;
  age: number;
  hometown: string;
}

const AddStudent = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IStudent>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (newStudent: IStudent) => {
      await axios.post("http://localhost:3000/students", newStudent);
    },
    onSuccess: () => {
      alert("Thêm sinh viên thành công!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      reset();
      navigate("/student");
    },
  });

  const onSubmit = (data: IStudent) => {
    mutation.mutate(data);
  };

  return (
    <div className="form-container">
      <h1 className="text-[2-rem] text-center font-bold my-5">Thêm Sinh Viên</h1>
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

        <button type="submit" className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700">
          Thêm Sinh Viên
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
