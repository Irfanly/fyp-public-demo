// 'use client';

// import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
// import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { 
//   PlusCircle, 
//   ClipboardList, 
//   Clock, 
//   CheckCircle2, 
//   Star, 
//   User2, 
//   Edit2,
//   UserPlus,
//   History
// } from "lucide-react";

const TaskManagementPage = () => {
  //Simple dashboard
  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
      </div>
    </div>
  );
};

// const TaskManagementPage = () => {
//   const [tasks, setTasks] = useState({
//     "New": [
//       {
//         id: 0,
//         title: "Review Requirements",
//         description: "Review and analyze project requirements",
//         assignee: "David",
//         lastUpdated: new Date().toISOString(),
//       },
//     ],
//     "Not Started": [
//       {
//         id: 1,
//         title: "Prepare Cleaning Supplies",
//         description: "Ensure all required cleaning tools are available.",
//         assignee: "Alice",
//         lastUpdated: new Date().toISOString(),
//       },
//     ],
//     "In Progress": [
//       {
//         id: 2,
//         title: "Coordinate with Volunteers",
//         description: "Organize volunteers into teams and assign tasks.",
//         assignee: "Bob",
//         lastUpdated: new Date().toISOString(),
//       },
//     ],
//     "Completed": [
//       {
//         id: 3,
//         title: "Finalize Budget",
//         description: "Submit the finalized budget for approval.",
//         assignee: "Charlie",
//         lastUpdated: new Date().toISOString(),
//       },
//     ],
//   });

//   const [newTask, setNewTask] = useState({
//     title: "",
//     description: "",
//     assignee: "",
//     progress: "New",
//   });

//   const [editingTask, setEditingTask] = useState(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

//   // Mock current user - In a real app, this would come from auth context
//   const currentUser = "CurrentUser";

//   const statusColors = {
//     "New": "bg-purple-100 text-purple-800",
//     "Not Started": "bg-gray-100 text-gray-800",
//     "In Progress": "bg-blue-100 text-blue-800",
//     "Completed": "bg-green-100 text-green-800",
//   };

//   const statusIcons = {
//     "New": <Star className="w-4 h-4" />,
//     "Not Started": <ClipboardList className="w-4 h-4" />,
//     "In Progress": <Clock className="w-4 h-4" />,
//     "Completed": <CheckCircle2 className="w-4 h-4" />,
//   };

//   const handleDragEnd = (result: { source: any; destination: any; }) => {
//     const { source, destination } = result;

//     if (!destination) return;

//     const sourceList = [...tasks[source.droppableId]];
//     const destinationList = [...tasks[destination.droppableId]];

//     const [movedTask] = sourceList.splice(source.index, 1);
    
//     // Update the task's status and last updated timestamp
//     const updatedTask = {
//       ...movedTask,
//       lastUpdated: new Date().toISOString(),
//     };
    
//     destinationList.splice(destination.index, 0, updatedTask);

//     const newTasks = {
//       ...tasks,
//       [source.droppableId]: sourceList,
//       [destination.droppableId]: destinationList,
//     };

//     setTasks(newTasks);

//     // Log status change for database update
//     console.log(`Task Status Change:`, {
//       taskId: movedTask.id,
//       title: movedTask.title,
//       oldStatus: source.droppableId,
//       newStatus: destination.droppableId,
//       timestamp: new Date().toISOString(),
//     });
//   };

//   const handleAddTask = () => {
//     if (newTask.title && newTask.description && newTask.assignee) {
//       const newTaskItem = {
//         id: Date.now(),
//         title: newTask.title,
//         description: newTask.description,
//         assignee: newTask.assignee,
//         lastUpdated: new Date().toISOString(),
//       };

//       setTasks({
//         ...tasks,
//         [newTask.progress]: [...tasks[newTask.progress], newTaskItem],
//       });
//       setNewTask({ title: "", description: "", assignee: "", progress: "New" });
//     }
//   };

//   const handleEditTask = () => {
//     if (!editingTask) return;

//     const updatedTasks = { ...tasks };
//     const statusKey = Object.keys(tasks).find(key => 
//       tasks[key].some(task => task.id === editingTask.id)
//     );

//     if (statusKey) {
//       updatedTasks[statusKey] = tasks[statusKey].map(task => 
//         task.id === editingTask.id 
//           ? { ...editingTask, lastUpdated: new Date().toISOString() }
//           : task
//       );

//       setTasks(updatedTasks);
//       setIsEditDialogOpen(false);
//       setEditingTask(null);

//       console.log(`Task Updated:`, {
//         taskId: editingTask.id,
//         title: editingTask.title,
//         description: editingTask.description,
//         assignee: editingTask.assignee,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   };

//   const handleSelfAssign = (taskId, status) => {
//     const updatedTasks = { ...tasks };
//     updatedTasks[status] = tasks[status].map(task => 
//       task.id === taskId 
//         ? { ...task, assignee: currentUser, lastUpdated: new Date().toISOString() }
//         : task
//     );

//     setTasks(updatedTasks);

//     console.log(`Task Self-Assigned:`, {
//       taskId: taskId,
//       newAssignee: currentUser,
//       timestamp: new Date().toISOString(),
//     });
//   };

//   const handleCloseEditDialog = () => {
//     setIsEditDialogOpen(false);
//     setEditingTask(null);
//   }

//   return (
//     <div className="bg-gray-50 p-8 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <PlusCircle className="w-4 h-4" />
//                 Add Task
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>Create New Task</DialogTitle>
//               </DialogHeader>
//               <div className="grid gap-4 py-4">
//                 <Input
//                   type="text"
//                   placeholder="Task Title"
//                   value={newTask.title}
//                   onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
//                 />
//                 <Textarea
//                   placeholder="Task Description"
//                   value={newTask.description}
//                   onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
//                 />
//                 <Input
//                   type="text"
//                   placeholder="Assignee"
//                   value={newTask.assignee}
//                   onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
//                 />
//                 <Select
//                   value={newTask.progress}
//                   onValueChange={(value) => setNewTask({ ...newTask, progress: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Object.keys(tasks).map((status) => (
//                       <SelectItem key={status} value={status}>
//                         {status}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <Button onClick={handleAddTask}>Create Task</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <DragDropContext onDragEnd={handleDragEnd}>
//           <div className="grid grid-cols-4 gap-6">
//             {Object.keys(tasks).map((status) => (
//               <Droppable key={status} droppableId={status}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className="bg-white rounded-lg shadow-sm p-4 min-h-[500px]"
//                   >
//                     <div className="flex items-center gap-2 mb-4">
//                       {statusIcons[status]}
//                       <h2 className="font-semibold text-lg">{status}</h2>
//                       <Badge variant="secondary" className="ml-auto">
//                         {tasks[status].length}
//                       </Badge>
//                     </div>
//                     <div className="space-y-3">
//                       {tasks[status].map((task, index) => (
//                         <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
//                           {(provided) => (
//                             <Card
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               className="bg-white border shadow-sm hover:shadow-md transition-shadow"
//                             >
//                               <CardHeader className="p-4 pb-2">
//                                 <div className="flex justify-between items-start">
//                                   <Badge className={`${statusColors[status]} mb-2`}>
//                                     {status}
//                                   </Badge>
//                                   <Dialog 
//                                     open={isEditDialogOpen && editingTask?.id === task.id} 
//                                     onOpenChange={(open) => {
//                                       if (!open) handleCloseEditDialog();
//                                     }}
//                                   >
//                                     <DialogTrigger asChild>
//                                       <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         className="h-8 w-8 p-0"
//                                         onClick={() => {
//                                           setEditingTask(task);
//                                           setIsEditDialogOpen(true);
//                                         }}
//                                       >
//                                         <Edit2 className="h-4 w-4" />
//                                       </Button>
//                                     </DialogTrigger>
//                                     <DialogContent className="sm:max-w-md">
//                                       <DialogHeader>
//                                         <DialogTitle>Edit Task</DialogTitle>
//                                       </DialogHeader>
//                                       <div className="grid gap-4 py-4">
//                                         <Input
//                                           placeholder="Task Title"
//                                           value={editingTask?.title || ""}
//                                           onChange={(e) =>
//                                             setEditingTask({
//                                               ...editingTask,
//                                               title: e.target.value,
//                                             })
//                                           }
//                                         />
//                                         <Textarea
//                                           placeholder="Task Description"
//                                           value={editingTask?.description || ""}
//                                           onChange={(e) =>
//                                             setEditingTask({
//                                               ...editingTask,
//                                               description: e.target.value,
//                                             })
//                                           }
//                                         />
//                                         <div className="flex justify-end gap-4">
//                                           <Button variant="outline" onClick={handleCloseEditDialog}>
//                                             Cancel
//                                           </Button>
//                                           <Button onClick={handleEditTask}>
//                                             Save Changes
//                                           </Button>
//                                         </div>
//                                       </div>
//                                     </DialogContent>
//                                   </Dialog>
//                                 </div>
//                                 <h3 className="font-semibold">{task.title}</h3>
//                               </CardHeader>
//                               <CardContent className="p-4 pt-0">
//                                 <p className="text-sm text-gray-600 mb-3">{task.description}</p>
//                                 <div className="flex items-center justify-between">
//                                   <div className="flex items-center text-sm text-gray-500">
//                                     <User2 className="w-4 h-4 mr-1" />
//                                     {task.assignee}
//                                   </div>
//                                   <div className="flex items-center gap-2">
//                                     <Button
//                                       variant="ghost"
//                                       size="sm"
//                                       onClick={() => handleSelfAssign(task.id, status)}
//                                       className="h-8 px-2"
//                                     >
//                                       <UserPlus className="h-4 w-4 mr-1" />
//                                       Assign to me
//                                     </Button>
//                                   </div>
//                                 </div>
//                               </CardContent>
//                               <CardFooter className="px-4 py-2 text-xs text-gray-500">
//                                 <History className="w-3 h-3 mr-1" />
//                                 Last updated: {new Date(task.lastUpdated).toLocaleString()}
//                               </CardFooter>
//                             </Card>
//                           )}
//                         </Draggable>
//                       ))}
//                     </div>
//                     {provided.placeholder}
//                   </div>
//                 )}
//               </Droppable>
//             ))}
//           </div>
//         </DragDropContext>
//       </div>
//     </div>
//   );
// };

export default TaskManagementPage;