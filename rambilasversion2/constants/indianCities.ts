export interface IndianCity {
  name: string;
  state: string;
  isCapital: boolean;
  category: 'capital' | 'major' | 'industrial' | 'transport';
}

export interface StateWithCities {
  state: string;
  capital: string;
  cities: IndianCity[];
}

export const indianCitiesData: StateWithCities[] = [
  {
    state: "Andhra Pradesh",
    capital: "Amaravati",
    cities: [
      { name: "Amaravati", state: "Andhra Pradesh", isCapital: true, category: "capital" },
      { name: "Visakhapatnam", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Vijayawada", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Guntur", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Nellore", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Kurnool", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Rajahmundry", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Tirupati", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Kadapa", state: "Andhra Pradesh", isCapital: false, category: "major" },
      { name: "Anantapur", state: "Andhra Pradesh", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Arunachal Pradesh",
    capital: "Itanagar",
    cities: [
      { name: "Itanagar", state: "Arunachal Pradesh", isCapital: true, category: "capital" },
      { name: "Naharlagun", state: "Arunachal Pradesh", isCapital: false, category: "major" },
      { name: "Pasighat", state: "Arunachal Pradesh", isCapital: false, category: "major" },
      { name: "Tezpur", state: "Arunachal Pradesh", isCapital: false, category: "major" },
      { name: "Bomdila", state: "Arunachal Pradesh", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Assam",
    capital: "Dispur",
    cities: [
      { name: "Dispur", state: "Assam", isCapital: true, category: "capital" },
      { name: "Guwahati", state: "Assam", isCapital: false, category: "major" },
      { name: "Silchar", state: "Assam", isCapital: false, category: "major" },
      { name: "Dibrugarh", state: "Assam", isCapital: false, category: "major" },
      { name: "Jorhat", state: "Assam", isCapital: false, category: "major" },
      { name: "Nagaon", state: "Assam", isCapital: false, category: "major" },
      { name: "Tinsukia", state: "Assam", isCapital: false, category: "major" },
      { name: "Tezpur", state: "Assam", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Bihar",
    capital: "Patna",
    cities: [
      { name: "Patna", state: "Bihar", isCapital: true, category: "capital" },
      { name: "Gaya", state: "Bihar", isCapital: false, category: "major" },
      { name: "Bhagalpur", state: "Bihar", isCapital: false, category: "major" },
      { name: "Muzaffarpur", state: "Bihar", isCapital: false, category: "major" },
      { name: "Darbhanga", state: "Bihar", isCapital: false, category: "major" },
      { name: "Purnia", state: "Bihar", isCapital: false, category: "major" },
      { name: "Arrah", state: "Bihar", isCapital: false, category: "major" },
      { name: "Begusarai", state: "Bihar", isCapital: false, category: "major" },
      { name: "Katihar", state: "Bihar", isCapital: false, category: "major" },
      { name: "Munger", state: "Bihar", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Chhattisgarh",
    capital: "Raipur",
    cities: [
      { name: "Raipur", state: "Chhattisgarh", isCapital: true, category: "capital" },
      { name: "Bhilai", state: "Chhattisgarh", isCapital: false, category: "major" },
      { name: "Bilaspur", state: "Chhattisgarh", isCapital: false, category: "major" },
      { name: "Korba", state: "Chhattisgarh", isCapital: false, category: "major" },
      { name: "Rajnandgaon", state: "Chhattisgarh", isCapital: false, category: "major" },
      { name: "Durg", state: "Chhattisgarh", isCapital: false, category: "major" },
      { name: "Jagdalpur", state: "Chhattisgarh", isCapital: false, category: "major" },
      { name: "Ambikapur", state: "Chhattisgarh", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Goa",
    capital: "Panaji",
    cities: [
      { name: "Panaji", state: "Goa", isCapital: true, category: "capital" },
      { name: "Margao", state: "Goa", isCapital: false, category: "major" },
      { name: "Vasco da Gama", state: "Goa", isCapital: false, category: "major" },
      { name: "Mapusa", state: "Goa", isCapital: false, category: "major" },
      { name: "Ponda", state: "Goa", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Gujarat",
    capital: "Gandhinagar",
    cities: [
      { name: "Gandhinagar", state: "Gujarat", isCapital: true, category: "capital" },
      { name: "Ahmedabad", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Surat", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Vadodara", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Rajkot", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Bhavnagar", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Jamnagar", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Junagadh", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Gandhidham", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Anand", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Navsari", state: "Gujarat", isCapital: false, category: "major" },
      { name: "Morbi", state: "Gujarat", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Haryana",
    capital: "Chandigarh",
    cities: [
      { name: "Chandigarh", state: "Haryana", isCapital: true, category: "capital" },
      { name: "Faridabad", state: "Haryana", isCapital: false, category: "major" },
      { name: "Gurgaon", state: "Haryana", isCapital: false, category: "major" },
      { name: "Panipat", state: "Haryana", isCapital: false, category: "major" },
      { name: "Ambala", state: "Haryana", isCapital: false, category: "major" },
      { name: "Yamunanagar", state: "Haryana", isCapital: false, category: "major" },
      { name: "Rohtak", state: "Haryana", isCapital: false, category: "major" },
      { name: "Hisar", state: "Haryana", isCapital: false, category: "major" },
      { name: "Karnal", state: "Haryana", isCapital: false, category: "major" },
      { name: "Sonipat", state: "Haryana", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Himachal Pradesh",
    capital: "Shimla",
    cities: [
      { name: "Shimla", state: "Himachal Pradesh", isCapital: true, category: "capital" },
      { name: "Dharamshala", state: "Himachal Pradesh", isCapital: false, category: "major" },
      { name: "Solan", state: "Himachal Pradesh", isCapital: false, category: "major" },
      { name: "Mandi", state: "Himachal Pradesh", isCapital: false, category: "major" },
      { name: "Palampur", state: "Himachal Pradesh", isCapital: false, category: "major" },
      { name: "Kullu", state: "Himachal Pradesh", isCapital: false, category: "major" },
      { name: "Baddi", state: "Himachal Pradesh", isCapital: false, category: "industrial" }
    ]
  },
  {
    state: "Jharkhand",
    capital: "Ranchi",
    cities: [
      { name: "Ranchi", state: "Jharkhand", isCapital: true, category: "capital" },
      { name: "Jamshedpur", state: "Jharkhand", isCapital: false, category: "major" },
      { name: "Dhanbad", state: "Jharkhand", isCapital: false, category: "major" },
      { name: "Bokaro", state: "Jharkhand", isCapital: false, category: "major" },
      { name: "Deoghar", state: "Jharkhand", isCapital: false, category: "major" },
      { name: "Phusro", state: "Jharkhand", isCapital: false, category: "major" },
      { name: "Hazaribagh", state: "Jharkhand", isCapital: false, category: "major" },
      { name: "Giridih", state: "Jharkhand", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Karnataka",
    capital: "Bangalore",
    cities: [
      { name: "Bangalore", state: "Karnataka", isCapital: true, category: "capital" },
      { name: "Mysore", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Hubli", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Mangalore", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Belgaum", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Gulbarga", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Davanagere", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Bellary", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Bijapur", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Shimoga", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Tumkur", state: "Karnataka", isCapital: false, category: "major" },
      { name: "Raichur", state: "Karnataka", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Kerala",
    capital: "Thiruvananthapuram",
    cities: [
      { name: "Thiruvananthapuram", state: "Kerala", isCapital: true, category: "capital" },
      { name: "Kochi", state: "Kerala", isCapital: false, category: "major" },
      { name: "Kozhikode", state: "Kerala", isCapital: false, category: "major" },
      { name: "Thrissur", state: "Kerala", isCapital: false, category: "major" },
      { name: "Palakkad", state: "Kerala", isCapital: false, category: "major" },
      { name: "Kollam", state: "Kerala", isCapital: false, category: "major" },
      { name: "Malappuram", state: "Kerala", isCapital: false, category: "major" },
      { name: "Kannur", state: "Kerala", isCapital: false, category: "major" },
      { name: "Kasaragod", state: "Kerala", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Madhya Pradesh",
    capital: "Bhopal",
    cities: [
      { name: "Bhopal", state: "Madhya Pradesh", isCapital: true, category: "capital" },
      { name: "Indore", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Gwalior", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Jabalpur", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Ujjain", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Sagar", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Dewas", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Satna", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Ratlam", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Rewa", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Murwara", state: "Madhya Pradesh", isCapital: false, category: "major" },
      { name: "Singrauli", state: "Madhya Pradesh", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Maharashtra",
    capital: "Mumbai",
    cities: [
      { name: "Mumbai", state: "Maharashtra", isCapital: true, category: "capital" },
      { name: "Pune", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Nagpur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Thane", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Nashik", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Aurangabad", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Solapur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Amravati", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Kolhapur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Sangli", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Malegaon", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Ulhasnagar", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Jalgaon", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Akola", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Latur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Ahmadnagar", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Dhule", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Ichalkaranji", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Parbhani", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Jalna", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Bhusawal", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Panvel", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Satara", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Beed", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Yavatmal", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Kamptee", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Gondia", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Barshi", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Achalpur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Osmanabad", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Nanded-Waghala", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Wardha", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Udgir", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Amalner", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Akot", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Pandharpur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Shrirampur", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Parli", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Washim", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Ratnagiri", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Buldhana", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Bid", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Bhandara", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Hingoli", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Nanded", state: "Maharashtra", isCapital: false, category: "major" },
      { name: "Sindhudurg", state: "Maharashtra", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Manipur",
    capital: "Imphal",
    cities: [
      { name: "Imphal", state: "Manipur", isCapital: true, category: "capital" },
      { name: "Thoubal", state: "Manipur", isCapital: false, category: "major" },
      { name: "Bishnupur", state: "Manipur", isCapital: false, category: "major" },
      { name: "Churachandpur", state: "Manipur", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Meghalaya",
    capital: "Shillong",
    cities: [
      { name: "Shillong", state: "Meghalaya", isCapital: true, category: "capital" },
      { name: "Tura", state: "Meghalaya", isCapital: false, category: "major" },
      { name: "Jowai", state: "Meghalaya", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Mizoram",
    capital: "Aizawl",
    cities: [
      { name: "Aizawl", state: "Mizoram", isCapital: true, category: "capital" },
      { name: "Lunglei", state: "Mizoram", isCapital: false, category: "major" },
      { name: "Saiha", state: "Mizoram", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Nagaland",
    capital: "Kohima",
    cities: [
      { name: "Kohima", state: "Nagaland", isCapital: true, category: "capital" },
      { name: "Dimapur", state: "Nagaland", isCapital: false, category: "major" },
      { name: "Mokokchung", state: "Nagaland", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Odisha",
    capital: "Bhubaneswar",
    cities: [
      { name: "Bhubaneswar", state: "Odisha", isCapital: true, category: "capital" },
      { name: "Cuttack", state: "Odisha", isCapital: false, category: "major" },
      { name: "Rourkela", state: "Odisha", isCapital: false, category: "major" },
      { name: "Berhampur", state: "Odisha", isCapital: false, category: "major" },
      { name: "Sambalpur", state: "Odisha", isCapital: false, category: "major" },
      { name: "Puri", state: "Odisha", isCapital: false, category: "major" },
      { name: "Balasore", state: "Odisha", isCapital: false, category: "major" },
      { name: "Bhadrak", state: "Odisha", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Punjab",
    capital: "Chandigarh",
    cities: [
      { name: "Chandigarh", state: "Punjab", isCapital: true, category: "capital" },
      { name: "Ludhiana", state: "Punjab", isCapital: false, category: "major" },
      { name: "Amritsar", state: "Punjab", isCapital: false, category: "major" },
      { name: "Jalandhar", state: "Punjab", isCapital: false, category: "major" },
      { name: "Patiala", state: "Punjab", isCapital: false, category: "major" },
      { name: "Bathinda", state: "Punjab", isCapital: false, category: "major" },
      { name: "Mohali", state: "Punjab", isCapital: false, category: "major" },
      { name: "Firozpur", state: "Punjab", isCapital: false, category: "major" },
      { name: "Batala", state: "Punjab", isCapital: false, category: "major" },
      { name: "Pathankot", state: "Punjab", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Rajasthan",
    capital: "Jaipur",
    cities: [
      { name: "Jaipur", state: "Rajasthan", isCapital: true, category: "capital" },
      { name: "Jodhpur", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Udaipur", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Kota", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Bikaner", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Ajmer", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Bharatpur", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Alwar", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Sikar", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Pali", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Sri Ganganagar", state: "Rajasthan", isCapital: false, category: "major" },
      { name: "Kishangarh", state: "Rajasthan", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Sikkim",
    capital: "Gangtok",
    cities: [
      { name: "Gangtok", state: "Sikkim", isCapital: true, category: "capital" },
      { name: "Namchi", state: "Sikkim", isCapital: false, category: "major" },
      { name: "Mangan", state: "Sikkim", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Tamil Nadu",
    capital: "Chennai",
    cities: [
      { name: "Chennai", state: "Tamil Nadu", isCapital: true, category: "capital" },
      { name: "Coimbatore", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Madurai", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Tiruchirappalli", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Salem", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Tirunelveli", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Tiruppur", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Erode", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Vellore", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Thoothukkudi", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Dindigul", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Thanjavur", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Ranipet", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Sivakasi", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Karur", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Udhagamandalam", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Hosur", state: "Tamil Nadu", isCapital: false, category: "major" },
      { name: "Nagercoil", state: "Tamil Nadu", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Telangana",
    capital: "Hyderabad",
    cities: [
      { name: "Hyderabad", state: "Telangana", isCapital: true, category: "capital" },
      { name: "Warangal", state: "Telangana", isCapital: false, category: "major" },
      { name: "Nizamabad", state: "Telangana", isCapital: false, category: "major" },
      { name: "Khammam", state: "Telangana", isCapital: false, category: "major" },
      { name: "Karimnagar", state: "Telangana", isCapital: false, category: "major" },
      { name: "Ramagundam", state: "Telangana", isCapital: false, category: "major" },
      { name: "Mahbubnagar", state: "Telangana", isCapital: false, category: "major" },
      { name: "Nalgonda", state: "Telangana", isCapital: false, category: "major" },
      { name: "Adilabad", state: "Telangana", isCapital: false, category: "major" },
      { name: "Suryapet", state: "Telangana", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Tripura",
    capital: "Agartala",
    cities: [
      { name: "Agartala", state: "Tripura", isCapital: true, category: "capital" },
      { name: "Dharmanagar", state: "Tripura", isCapital: false, category: "major" },
      { name: "Udaipur", state: "Tripura", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Uttar Pradesh",
    capital: "Lucknow",
    cities: [
      { name: "Lucknow", state: "Uttar Pradesh", isCapital: true, category: "capital" },
      { name: "Kanpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Ghaziabad", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Agra", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Meerut", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Varanasi", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Allahabad", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Bareilly", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Aligarh", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Moradabad", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Saharanpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Gorakhpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Firozabad", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Jhansi", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Muzaffarnagar", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Mathura", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Shahjahanpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Rampur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Modinagar", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Hapur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Etawah", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Mirzapur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Bulandshahr", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Sambhal", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Amroha", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Hardoi", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Fatehpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Raebareli", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Orai", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Sitapur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Bahraich", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Modinagar", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Hathras", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Banda", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Pilibhit", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Lakhimpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Basti", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Deoria", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Ujhani", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Ghazipur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Sultanpur", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Azamgarh", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Bijnor", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Sahaswan", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Najibabad", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Shamli", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Awagarh", state: "Uttar Pradesh", isCapital: false, category: "major" },
      { name: "Kasganj", state: "Uttar Pradesh", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Uttarakhand",
    capital: "Dehradun",
    cities: [
      { name: "Dehradun", state: "Uttarakhand", isCapital: true, category: "capital" },
      { name: "Haridwar", state: "Uttarakhand", isCapital: false, category: "major" },
      { name: "Roorkee", state: "Uttarakhand", isCapital: false, category: "major" },
      { name: "Rudrapur", state: "Uttarakhand", isCapital: false, category: "major" },
      { name: "Kashipur", state: "Uttarakhand", isCapital: false, category: "major" },
      { name: "Haldwani", state: "Uttarakhand", isCapital: false, category: "major" },
      { name: "Rishikesh", state: "Uttarakhand", isCapital: false, category: "major" }
    ]
  },
  {
    state: "West Bengal",
    capital: "Kolkata",
    cities: [
      { name: "Kolkata", state: "West Bengal", isCapital: true, category: "capital" },
      { name: "Asansol", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Siliguri", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Durgapur", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Bardhaman", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Malda", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Bahraich", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Habra", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Kharagpur", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Shantipur", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Dankuni", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Dhulian", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Ranaghat", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Haldia", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Raiganj", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Krishnanagar", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Nabadwip", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Medinipur", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Jalpaiguri", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Balurghat", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Basirhat", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Bankura", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Chakdaha", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Darjeeling", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Alipurduar", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Purulia", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Jangipur", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Bangaon", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Cooch Behar", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Bardhaman", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Krishnanagar", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Berhampore", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Balurghat", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Jalpaiguri", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Purulia", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Alipurduar", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Malda", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Jangipur", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Bangaon", state: "West Bengal", isCapital: false, category: "major" },
      { name: "Cooch Behar", state: "West Bengal", isCapital: false, category: "major" }
    ]
  },
  // Union Territories
  {
    state: "Andaman and Nicobar Islands",
    capital: "Port Blair",
    cities: [
      { name: "Port Blair", state: "Andaman and Nicobar Islands", isCapital: true, category: "capital" },
      { name: "Diglipur", state: "Andaman and Nicobar Islands", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Chandigarh",
    capital: "Chandigarh",
    cities: [
      { name: "Chandigarh", state: "Chandigarh", isCapital: true, category: "capital" }
    ]
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    capital: "Daman",
    cities: [
      { name: "Daman", state: "Dadra and Nagar Haveli and Daman and Diu", isCapital: true, category: "capital" },
      { name: "Diu", state: "Dadra and Nagar Haveli and Daman and Diu", isCapital: false, category: "major" },
      { name: "Silvassa", state: "Dadra and Nagar Haveli and Daman and Diu", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Delhi",
    capital: "New Delhi",
    cities: [
      { name: "New Delhi", state: "Delhi", isCapital: true, category: "capital" },
      { name: "Delhi", state: "Delhi", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Jammu and Kashmir",
    capital: "Srinagar",
    cities: [
      { name: "Srinagar", state: "Jammu and Kashmir", isCapital: true, category: "capital" },
      { name: "Jammu", state: "Jammu and Kashmir", isCapital: false, category: "major" },
      { name: "Anantnag", state: "Jammu and Kashmir", isCapital: false, category: "major" },
      { name: "Baramulla", state: "Jammu and Kashmir", isCapital: false, category: "major" },
      { name: "Sopore", state: "Jammu and Kashmir", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Ladakh",
    capital: "Leh",
    cities: [
      { name: "Leh", state: "Ladakh", isCapital: true, category: "capital" },
      { name: "Kargil", state: "Ladakh", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Lakshadweep",
    capital: "Kavaratti",
    cities: [
      { name: "Kavaratti", state: "Lakshadweep", isCapital: true, category: "capital" },
      { name: "Agatti", state: "Lakshadweep", isCapital: false, category: "major" }
    ]
  },
  {
    state: "Puducherry",
    capital: "Puducherry",
    cities: [
      { name: "Puducherry", state: "Puducherry", isCapital: true, category: "capital" },
      { name: "Karaikal", state: "Puducherry", isCapital: false, category: "major" },
      { name: "Mahe", state: "Puducherry", isCapital: false, category: "major" },
      { name: "Yanam", state: "Puducherry", isCapital: false, category: "major" }
    ]
  }
];

// Helper functions
export const getAllCities = (): IndianCity[] => {
  return indianCitiesData.flatMap(stateData => stateData.cities);
};

export const getCitiesByState = (state: string): IndianCity[] => {
  const stateData = indianCitiesData.find(s => s.state === state);
  return stateData ? stateData.cities : [];
};

export const getCityNames = (): string[] => {
  return getAllCities().map(city => city.name);
};

export const getCityNamesByState = (state: string): string[] => {
  return getCitiesByState(state).map(city => city.name);
};

export const getStateCapitals = (): IndianCity[] => {
  return getAllCities().filter(city => city.isCapital);
};

export const searchCities = (query: string, state?: string): IndianCity[] => {
  const cities = state ? getCitiesByState(state) : getAllCities();
  const lowercaseQuery = query.toLowerCase();
  
  return cities.filter(city => 
    city.name.toLowerCase().includes(lowercaseQuery) ||
    city.state.toLowerCase().includes(lowercaseQuery)
  );
};

export const getStates = (): string[] => {
  return indianCitiesData.map(stateData => stateData.state);
};

export const getStateCapitalsMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  indianCitiesData.forEach(stateData => {
    map[stateData.state] = stateData.capital;
  });
  return map;
};
