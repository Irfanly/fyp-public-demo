'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit2, Clipboard, ArrowRight, CheckCircle2, Clock, User, ChevronDown, ChevronUp, Eye, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import firestore from "@/services/firestore";
import { tasks, userDetailsList } from "@/lib/type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TaskDashboard = ({ eventID } : { eventID : string}) => {
  const [tasks, setTasks] = useState<tasks[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<tasks | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<{[key: string]: boolean}>({});
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<tasks | null>(null);
  const [teamMembers, setTeamMembers] = useState<userDetailsList[]>([]);

  const [newTask, setNewTask] = useState<tasks>({
    eventID: eventID as string,
    createdBy: "",
    title: "",
    description: "",
    assignedTo: "",
    status: "New",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await firestore.getTasks(eventID);
        setTasks(fetchedTasks);
        fetchTeamMembers();
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [eventID]);

  const fetchTeamMembers = async () => {
    try {
      const members = await firestore.getTeamMembers(eventID);
      setTeamMembers(members as userDetailsList[]);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    if (!tasks) return;
  
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    
    // Update the status based on the column it's dropped into
    movedTask.status = result.destination.droppableId;
  
    updatedTasks.splice(result.destination.index, 0, movedTask);
  
    try {
      // Update task status in Firestore
      await firestore.updateTaskStatus(movedTask.taskID, movedTask.status);
      setTasks(updatedTasks);
      
      toast({
        title: "Task updated",
        description: `Task "${movedTask.title}" moved to ${movedTask.status}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      try {
        const createdTask = { 
          ...newTask, 
          eventID: eventID as string,
          createdAt: new Date().toISOString(),
        };
        await firestore.createTask(eventID, createdTask);
        setNewTask({ eventID: eventID as string, createdBy: "", title: "", description: "", assignedTo: "", status: "New" });
        toast({
          title: "Task created",
          description: "The task has been successfully created.",
          variant: "default",
        });
        //Update state directly
        setTasks([...(tasks ?? []), createdTask]);
        setIsDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const handleEditClick = (task: tasks) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    try {
      await firestore.editTask(selectedTask.taskID, selectedTask);
            
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
        variant: "default",
      });
      
      // Update the tasks state to reflect the changes
      if (tasks) {
        const updatedTasks = tasks.map(task => 
          task.taskID === selectedTask.taskID ? selectedTask : task
        );
        setTasks(updatedTasks);
      }
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleViewTask = (task: tasks) => {
    setViewingTask(task);
    setViewTaskDialogOpen(true);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const removeAssignment = (taskToUpdate: tasks) => {
    if (taskToUpdate.taskID) {
      // For existing task
      const updatedTask = {...taskToUpdate, assignedTo: ""};
      setSelectedTask(updatedTask);
      
      // If this is happening outside the edit dialog (e.g. from view dialog)
      // we need to update in Firestore directly
      if (!isEditDialogOpen) {
        firestore.editTask(updatedTask.taskID, updatedTask)
          .then(() => {
            // Update tasks state
            if (tasks) {
              const updatedTasks = tasks.map(task => 
                task.taskID === updatedTask.taskID ? updatedTask : task
              );
              setTasks(updatedTasks);
            }
            
            // If this is the currently viewing task, update it too
            if (viewingTask && viewingTask.taskID === updatedTask.taskID) {
              setViewingTask(updatedTask);
            }
            
            toast({
              title: "Assignment removed",
              description: "The task is no longer assigned to anyone.",
              variant: "default",
            });
          })
          .catch(error => {
            console.error("Error removing assignment:", error);
          });
      }
    } else {
      // For new task
      setNewTask({...newTask, assignedTo: ""});
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <Clipboard className="w-5 h-5 text-blue-500" />;
      case "In Progress":
        return <ArrowRight className="w-5 h-5 text-yellow-500" />;
      case "Completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="flex flex-col space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
              <p className="text-gray-500">Manage and track your event tasks</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" size="lg">
                  <PlusCircle className="w-5 h-5" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Enter the details below to create a new task.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Task Title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="description"
                      placeholder="Task Description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="assignedTo" className="text-sm font-medium">Assigned To</label>
                    <div className="flex gap-2 items-center">
                      {teamMembers.length > 0 ? (
                        <Select 
                          value={newTask.assignedTo} 
                          onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a team member" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.userID} value={member.name || member.userID}>
                                {member.name || member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="assignedTo"
                          type="text"
                          placeholder="Assign to someone"
                          value={newTask.assignedTo}
                          onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        />
                      )}
                      {newTask.assignedTo && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAssignment(newTask)}
                          title="Remove assignment"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddTask}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Task Board Grid */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["New", "In Progress", "Completed"].map((status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-h-[500px] ${
                        snapshot.isDraggingOver ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-6 py-2 border-b border-gray-100">
                        {getStatusIcon(status)}
                        <h2 className="text-lg font-semibold">{status}</h2>
                        <Badge variant="secondary" className="ml-auto">
                          {tasks?.filter(task => task.status === status).length || 0}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        {tasks && tasks.filter((task) => task.status === status).map((task, index) => (
                          <Draggable 
                            key={task.taskID ?? `task-${index}`} 
                            draggableId={task.taskID ?? `task-${index}`} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transform transition-all duration-200 hover:shadow-md ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400" : ""
                                }`}
                              >
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <h3 className="font-medium text-lg leading-tight">{task.title}</h3>
                                      <Badge className={`${getStatusColor(task.status)}`}>
                                        {task.status}
                                      </Badge>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleViewTask(task)}
                                        title="View full details"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEditClick(task)}
                                        title="Edit task"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                  {task.description && (
                                    <div className="mb-3">
                                      <p className="text-gray-700 whitespace-pre-line">
                                        {expandedTasks[task.taskID || ''] 
                                          ? task.description 
                                          : truncateText(task.description, 100)}
                                      </p>
                                      {task.description.length > 100 && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="mt-1 h-6 px-2 text-xs text-gray-500"
                                          onClick={() => toggleTaskExpansion(task.taskID || '')}
                                        >
                                          {expandedTasks[task.taskID || ''] ? (
                                            <>
                                              <ChevronUp className="h-3 w-3 mr-1" /> Show less
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="h-3 w-3 mr-1" /> Show more
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center text-sm text-gray-500 mt-2">
                                    <User className="h-4 w-4 mr-1" />
                                    <span>{task.assignedTo || "Not yet assigned"}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>

          {/* Edit Task Dialog */}
          {selectedTask && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>Modify the task details below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
                    <Input
                      id="edit-title"
                      type="text"
                      placeholder="Task Title"
                      value={selectedTask.title}
                      onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="edit-description"
                      placeholder="Task Description"
                      value={selectedTask.description}
                      onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                      className="h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-assignedTo" className="text-sm font-medium">Assigned To</label>
                    <div className="flex gap-2 items-center">
                      {teamMembers.length > 0 ? (
                        <Select 
                          value={selectedTask.assignedTo || ""} 
                          onValueChange={(value) => setSelectedTask({...selectedTask, assignedTo: value})}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a team member" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.userID} value={member.name || member.userID}>
                                {member.name || member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="edit-assignedTo"
                          type="text"
                          placeholder="Assign to someone"
                          value={selectedTask.assignedTo || ""}
                          onChange={(e) => setSelectedTask({ ...selectedTask, assignedTo: e.target.value })}
                        />
                      )}
                      {selectedTask.assignedTo && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAssignment(selectedTask)}
                          title="Remove assignment"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateTask}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* View Task Dialog */}
          {viewingTask && (
            <Dialog open={viewTaskDialogOpen} onOpenChange={setViewTaskDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{viewingTask.title}</DialogTitle>
                  <div className="mt-2">
                    <Badge className={`${getStatusColor(viewingTask.status)}`}>
                      {viewingTask.status}
                    </Badge>
                  </div>
                </DialogHeader>
                <div className="py-4">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <div className="bg-gray-50 p-4 rounded-md text-gray-800 whitespace-pre-line">
                      {viewingTask.description || "No description provided."}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h4>
                      <div className="flex items-center gap-2">
                        <p className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-400" />
                          {viewingTask.assignedTo || "Not yet assigned"}
                        </p>
                        {viewingTask.assignedTo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 py-0"
                            onClick={() => {
                              const updatedTask = {...viewingTask, assignedTo: ""};
                              setViewingTask(updatedTask);
                              if (updatedTask.taskID) {
                                removeAssignment(updatedTask);
                              }
                            }}
                          >
                            <X className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewTaskDialogOpen(false)}>Close</Button>
                  <Button onClick={() => {
                    setViewTaskDialogOpen(false);
                    handleEditClick(viewingTask);
                  }}>Edit Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;