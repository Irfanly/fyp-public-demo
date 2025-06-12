export class Helper {
    formatTime(time: string) {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    }

    formatDate(date: string) {
        //format to match local date
        return new Date(date).toLocaleDateString();
    }
}

const helper = new Helper();
export default helper;