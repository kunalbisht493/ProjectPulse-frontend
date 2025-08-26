export default function getInitials(name){
    if(name) return name.trim().split(' ').map(n=>n[0].toUpperCase()).join("");
}