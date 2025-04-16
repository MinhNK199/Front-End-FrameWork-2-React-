import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface IStudent {
  id: number;
  name: string;
  class: string;
  age: number;
  hometown: string;
}

const StudentList = () => {
  const { data, isLoading } = useQuery<IStudent[]>({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const { data: students } = await axios.get("http://localhost:3000/students");
        return students;
      } catch (error) {
        return [];
      }
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await axios.delete(`http://localhost:3000/students/${id}`);
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      alert("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const delStudent = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này không?")) {
      mutation.mutate(id);
    }
  };

  if (isLoading) {
    return <>Đang tải dữ liệu...</>;
  }

  return (
    <div>
      <h1 className="text-[2-rem] text-center font-bold my-5">Danh sách sinh viên</h1>
      <Link className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 transition"
        to={"/student/add"}> Thêm mới</Link>
      <table className="w-full [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2">

        <thead>
          <tr>
            <th>STT</th>
            <th>Họ Tên</th>
            <th>Lớp</th>
            <th>Tuổi</th>
            <th>Quê Quán</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((student, index) => (
              <tr key={student.id} style={{ backgroundColor: index % 2 === 0 ? "yellow" : "lightgreen" }}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td>{student.class}</td>
                <td>{student.age}</td>
                <td>{student.hometown}</td>
                <td>
                  <Link
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition mr-2"
                    to={`/student/edit/${student.id}`}
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => delStudent(student.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                  >
                    Xóa
                  </button>

                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
