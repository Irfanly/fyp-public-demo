'use client';

import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import firestore from "@/services/firestore";
import { on } from 'events';

interface ChangeStatusModalProps {
  eventID: string;
  currentStatus: string;
  onClose: () => void;
  onStatusChange: (newStatus: string) => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ eventID, currentStatus, onClose, onStatusChange }) => {
  const [newStatus, setNewStatus] = useState(currentStatus);

  const handleStatusChange = async () => {
    try {
      await firestore.updateEventStatus(eventID, newStatus);

      onStatusChange(newStatus);
      
      toast({
        title: "Event Status Updated",
        description: `The event status has been changed to ${newStatus}.`,
        variant: "default",
      });
      onClose();
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the event status. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Event Status</DialogTitle>
          <DialogDescription asChild>
            <div>
              Select the new status for the event. Please note the following:
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                <li><strong>Planning:</strong> The event is not available for registration yet.</li>
                <li><strong>Active:</strong> The event will be available for registration.</li>
                <li><strong>Ongoing:</strong> Open attendance for students to take attendance.</li>
                <li><strong>Past:</strong> The event is no longer available for registration and won't show up on students' pages.</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="event-status">Event Status</Label>
            <Select
              name="eventStatus"
              value={newStatus}
              onValueChange={(value) => setNewStatus(value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleStatusChange}>Change Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeStatusModal;