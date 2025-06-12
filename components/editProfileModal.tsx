'use client';
import React, { useEffect,useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import firestore from "@/services/firestore";
import { users, students, school } from "@//lib/type/index";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: users;
  studentData: students;
  onUpdateProfile: (userData: Partial<users>, studentData: Partial<students>) => Promise<void>;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  userData,
  studentData,
  onUpdateProfile,
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: studentData?.phone || "",
    matricNo: studentData?.matricNo || "",
    programme: studentData?.programme || "",
    year: studentData?.year || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolList, setSchoolList] = useState<school[]>();
  const [phoneValidation, setPhoneValidation ] = useState("");
  const [matricNoValidation, setMatricNoValidation] = useState("");

  //fetch school data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolResult = await firestore.getSchoolList();
        setSchoolList(schoolResult);
      } catch (err : any) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if(!validatePhone(formData.phone) || !validateMatricNo(formData.matricNo)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const userUpdateData: Partial<users> = {
        name: formData.name,
        email: formData.email,
      };

      const studentUpdateData: Partial<students> = {
        phone: formData.phone,
        matricNo: formData.matricNo,
        programme: formData.programme,
        year: formData.year,
      };

      await onUpdateProfile(userUpdateData, studentUpdateData);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePhone = (phone : string) => {
    const phoneRegex = /^(\+?60|0)[1-9]\d{7,9}$/; // Malaysian phone number regex
    return phoneRegex.test(phone.toString());
  };

  const validateMatricNo = (matricNo : string) => {
    const matricRegex = /^\d{6,8}$/; // Only numbers, 6 to 8 digits long
    return matricRegex.test(matricNo);
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setFormData((prev) => ({ ...prev, phone }));

    if (!validatePhone(phone)) {
      setPhoneValidation("Invalid phone number format");
    } else {
      setPhoneValidation("");
    }
  };

  const handleMatricNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const matricNo = e.target.value;
    
    // Prevent non-numeric input
    if (!/^\d*$/.test(matricNo)) return;

    setFormData((prev) => ({ ...prev, matricNo }));

    if (!validateMatricNo(matricNo)) {
      setMatricNoValidation("Matric number must be 6 to 8 digits long");
    } else {
      setMatricNoValidation("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                className={phoneValidation ? "border-red-500" : ""}
              />
              {phoneValidation && (
                <p className="text-sm text-red-500">{phoneValidation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricNo">Matric Number</Label>
              <Input
                id="matricNo"
                value={formData.matricNo}
                onChange={handleMatricNoChange}
                placeholder="Enter your matric number"
                className={matricNoValidation ? "border-red-500" : ""}
              />
              {matricNoValidation && (
                <p className="text-sm text-red-500">{matricNoValidation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="programme">Programme</Label>
              <Select
                value={formData.programme}
                onValueChange={(value) => setFormData(prev => ({ ...prev, programme: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a programme" />
                </SelectTrigger>
                <SelectContent>
                  {schoolList?.map((school) => (
                    <SelectItem key={school.schoolID} value={school.name}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year of Study</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First">1st Year</SelectItem>
                  <SelectItem value="Second">2nd Year</SelectItem>
                  <SelectItem value="Third">3rd Year</SelectItem>
                  <SelectItem value="Fourth">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;