const { z } = require("zod");

const assignTaskSchema = z.object({
  task_ids: z
    .array(
      z
        .number({ error: "Id công việc phải là số" })
        .int("Công việc không hợp lệ")
        .positive("Công việc không hợp lệ"),
    )
    .min(1, "Phải chọn ít nhất một công việc"),
  technician_id: z
    .number({
      error: (issue) =>
        issue.input == null
          ? "Kỹ thuật viên là bắt buộc"
          : "Id kỹ thuật viên phải là số",
    })
    .int("Kỹ thuật viên không hợp lệ")
    .positive("Kỹ thuật viên không hợp lệ"),
});

module.exports = { assignTaskSchema };

