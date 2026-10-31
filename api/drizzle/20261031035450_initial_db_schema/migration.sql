CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"patient_name" varchar(255) NOT NULL,
	"doctor_id" uuid NOT NULL,
	"exam_id" integer NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" integer PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"duration_minutes" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"doctor_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_exam_id_exams_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id");--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");