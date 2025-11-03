// Comprehensive Indian States, Union Territories, and Major Cities Database

export interface StateInfo {
    name: string;
    capital: string;
    type: 'state' | 'union_territory';
    cities: string[];
}

export const INDIAN_STATES_AND_CITIES: StateInfo[] = [
    {
        name: 'Andhra Pradesh',
        capital: 'Amaravati',
        type: 'state',
        cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kadapa', 'Anantapur', 'Chittoor', 'Rajahmundry', 'Kakinada', 'Ongole', 'Eluru', 'Machilipatnam', 'Tenali', 'Proddatur', 'Chilakaluripet', 'Hindupur', 'Nandyal', 'Adoni']
    },
    {
        name: 'Arunachal Pradesh',
        capital: 'Itanagar',
        type: 'state',
        cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Dibrugarh', 'Tinsukia', 'Jorhat', 'Sibsagar', 'North Lakhimpur', 'Bongaigaon']
    },
    {
        name: 'Assam',
        capital: 'Dispur',
        type: 'state',
        cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Barpeta', 'Bongaigaon', 'Goalpara', 'Karimganj', 'Sivasagar', 'Dhubri', 'Hailakandi', 'Kokrajhar', 'Lakhimpur', 'Morigaon', 'Nalbari', 'Sivasagar', 'Udalguri']
    },
    {
        name: 'Bihar',
        capital: 'Patna',
        type: 'state',
        cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Ara', 'Begusarai', 'Katihar', 'Munger', 'Chapra', 'Sasaram', 'Dehri', 'Bettiah', 'Motihari', 'Hajipur', 'Sitamarhi', 'Samastipur', 'Saharsa', 'Kishanganj']
    },
    {
        name: 'Chhattisgarh',
        capital: 'Raipur',
        type: 'state',
        cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Mahasamund', 'Kanker', 'Janjgir', 'Kawardha', 'Bemetara', 'Mungeli', 'Surajpur', 'Balod', 'Baloda Bazar', 'Gariaband']
    },
    {
        name: 'Goa',
        capital: 'Panaji',
        type: 'state',
        cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao', 'Curchorem', 'Sanquelim', 'Bicholim', 'Valpoi', 'Canacona', 'Sanguem', 'Quepem', 'Pernem', 'Tiswadi', 'Bardez', 'Salcete', 'Mormugao', 'Dharbandora', 'Sattari']
    },
    {
        name: 'Gujarat',
        capital: 'Gandhinagar',
        type: 'state',
        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Godhra']
    },
    {
        name: 'Haryana',
        capital: 'Chandigarh',
        type: 'state',
        cities: ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Narnaul', 'Fatehabad']
    },
    {
        name: 'Himachal Pradesh',
        capital: 'Shimla',
        type: 'state',
        cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Baddi', 'Palampur', 'Nahan', 'Una', 'Chamba', 'Kangra', 'Kullu', 'Bilaspur', 'Hamirpur', 'Nalagarh', 'Paonta Sahib', 'Sundarnagar', 'Rampur', 'Theog', 'Rohru', 'Kasauli']
    },
    {
        name: 'Jharkhand',
        capital: 'Ranchi',
        type: 'state',
        cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Jhumri Telaiya', 'Medininagar', 'Chirkunda', 'Gumla', 'Dumka', 'Chaibasa', 'Jharia', 'Ghatshila', 'Muri', 'Barkakana', 'Mugma']
    },
    {
        name: 'Karnataka',
        capital: 'Bangalore',
        type: 'state',
        cities: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi', 'Chitradurga', 'Kolar', 'Mandya']
    },
    {
        name: 'Kerala',
        capital: 'Thiruvananthapuram',
        type: 'state',
        cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad', 'Kollam', 'Malappuram', 'Kannur', 'Alappuzha', 'Kasaragod', 'Pathanamthitta', 'Kottayam', 'Idukki', 'Wayanad', 'Ernakulam', 'Kannur', 'Kozhikode', 'Malappuram', 'Palakkad', 'Thrissur']
    },
    {
        name: 'Madhya Pradesh',
        capital: 'Bhopal',
        type: 'state',
        cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Chhindwara', 'Morena', 'Bhind', 'Guna', 'Shivpuri', 'Vidisha']
    },
    {
        name: 'Maharashtra',
        capital: 'Mumbai',
        type: 'state',
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Malegaon', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalgaon', 'Bhusawal', 'Panvel']
    },
    {
        name: 'Manipur',
        capital: 'Imphal',
        type: 'state',
        cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Tamenglong', 'Ukhrul', 'Chandel', 'Kakching', 'Jiribam', 'Moreh', 'Lilong', 'Wangjing', 'Mayang Imphal', 'Lamlai', 'Sekmai', 'Kakching Khunou', 'Kumbi', 'Sugnu', 'Moirang']
    },
    {
        name: 'Meghalaya',
        capital: 'Shillong',
        type: 'state',
        cities: ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Baghmara', 'Mairang', 'Amlarem', 'Khliehriat', 'Mawkyrwat', 'Nongpoh', 'Resubelpara', 'Mawphlang', 'Mawryngkneng', 'Mawlaik', 'Mawshynrut', 'Mawkyrwat', 'Mawphlang', 'Mawryngkneng', 'Mawlaik']
    },
    {
        name: 'Mizoram',
        capital: 'Aizawl',
        type: 'state',
        cities: ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit', 'Saitual', 'Khawzawl', 'Hnahthial', 'Siaha', 'Lawngtlai', 'Saitual', 'Khawzawl', 'Hnahthial', 'Siaha', 'Lawngtlai', 'Mamit', 'Serchhip', 'Kolasib']
    },
    {
        name: 'Nagaland',
        capital: 'Kohima',
        type: 'state',
        cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon', 'Kiphire', 'Longleng', 'Peren', 'Noklak', 'Shamator', 'Tseminyu', 'Niuland', 'Chumukedima', 'Medziphema', 'Jalukie', 'Pfutsero', 'Meluri']
    },
    {
        name: 'Odisha',
        capital: 'Bhubaneswar',
        type: 'state',
        cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Bargarh', 'Jharsuguda', 'Baleshwar', 'Kendujhar', 'Mayurbhanj', 'Dhenkanal', 'Angul', 'Kendrapada', 'Jagatsinghpur', 'Kendrapara', 'Nayagarh']
    },
    {
        name: 'Punjab',
        capital: 'Chandigarh',
        type: 'state',
        cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Sangrur', 'Faridkot']
    },
    {
        name: 'Rajasthan',
        capital: 'Jaipur',
        type: 'state',
        cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bharatpur', 'Alwar', 'Bhilwara', 'Ganganagar', 'Sikar', 'Pali', 'Tonk', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dungarpur', 'Banswara', 'Chittorgarh', 'Baran']
    },
    {
        name: 'Sikkim',
        capital: 'Gangtok',
        type: 'state',
        cities: ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Ravangla', 'Singtam', 'Rangpo', 'Jorethang', 'Pakyong', 'Rhenock', 'Soreng', 'Yuksom', 'Lachung', 'Lachen', 'Pelling', 'Ravangla', 'Singtam', 'Rangpo', 'Jorethang', 'Pakyong']
    },
    {
        name: 'Tamil Nadu',
        capital: 'Chennai',
        type: 'state',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukkudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Cuddalore']
    },
    {
        name: 'Telangana',
        capital: 'Hyderabad',
        type: 'state',
        cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Sangareddy', 'Vikarabad', 'Wanaparthy', 'Mahabubabad', 'Jangaon', 'Bodhan', 'Siddipet', 'Nirmal']
    },
    {
        name: 'Tripura',
        capital: 'Agartala',
        type: 'state',
        cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Ambassa', 'Kailasahar', 'Belonia', 'Kumarghat', 'Teliamura', 'Amarpur', 'Sabroom', 'Kamalpur', 'Bishalgarh', 'Santirbazar', 'Melaghar', 'Jirania', 'Ranirbazar', 'Sonamura', 'Dhalai', 'Gomati', 'Sepahijala']
    },
    {
        name: 'Uttar Pradesh',
        capital: 'Lucknow',
        type: 'state',
        cities: ['Lucknow', 'Kanpur', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly', 'Ghaziabad', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Shahjahanpur', 'Rampur', 'Modinagar', 'Hapur']
    },
    {
        name: 'Uttarakhand',
        capital: 'Dehradun',
        type: 'state',
        cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Kashipur', 'Rudrapur', 'Haldwani', 'Rishikesh', 'Ramnagar', 'Pauri', 'Srinagar', 'Kotdwara', 'Mussoorie', 'Nainital', 'Almora', 'Pithoragarh', 'Champawat', 'Bageshwar', 'Chamoli', 'Tehri', 'Uttarkashi']
    },
    {
        name: 'West Bengal',
        capital: 'Kolkata',
        type: 'state',
        cities: ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Bahraich', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat']
    },
    // Union Territories
    {
        name: 'Andaman and Nicobar Islands',
        capital: 'Port Blair',
        type: 'union_territory',
        cities: ['Port Blair', 'Diglipur', 'Mayabunder', 'Rangat', 'Havelock Island', 'Neil Island', 'Long Island', 'Baratang', 'Wandoor', 'Chidiatapu', 'Mount Harriet', 'Ross Island', 'Viper Island', 'North Bay', 'Jolly Buoy', 'Red Skin Island', 'Cinque Island', 'Little Andaman', 'Car Nicobar', 'Great Nicobar']
    },
    {
        name: 'Chandigarh',
        capital: 'Chandigarh',
        type: 'union_territory',
        cities: ['Chandigarh', 'Sector 1', 'Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Sector 44', 'Sector 45', 'Sector 46', 'Sector 47', 'Sector 48', 'Sector 49', 'Sector 50', 'Sector 51', 'Sector 52', 'Sector 53', 'Sector 54', 'Sector 55', 'Sector 56', 'Sector 57']
    },
    {
        name: 'Dadra and Nagar Haveli and Daman and Diu',
        capital: 'Daman',
        type: 'union_territory',
        cities: ['Daman', 'Diu', 'Silvassa', 'Dadra', 'Nagar Haveli', 'Vapi', 'Bhilad', 'Kadaiya', 'Khanvel', 'Naroli', 'Rakholi', 'Samarvarni', 'Sili', 'Tighra', 'Umbarkoi', 'Vaghvali', 'Vansda', 'Velugam', 'Viraval', 'Zari']
    },
    {
        name: 'Delhi',
        capital: 'New Delhi',
        type: 'union_territory',
        cities: ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi', 'Chandni Chowk', 'Connaught Place', 'Karol Bagh', 'Paharganj', 'Daryaganj', 'Jama Masjid', 'Red Fort', 'India Gate', 'Lotus Temple']
    },
    {
        name: 'Jammu and Kashmir',
        capital: 'Srinagar',
        type: 'union_territory',
        cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Pulwama', 'Kupwara', 'Rajouri', 'Samba', 'Udhampur', 'Doda', 'Kishtwar', 'Ramban', 'Reasi', 'Poonch', 'Shopian', 'Ganderbal', 'Bandipora', 'Kulgam', 'Budgam']
    },
    {
        name: 'Ladakh',
        capital: 'Leh',
        type: 'union_territory',
        cities: ['Leh', 'Kargil', 'Drass', 'Zanskar', 'Nubra Valley', 'Pangong Tso', 'Tso Moriri', 'Hemis', 'Alchi', 'Thiksey', 'Shey', 'Stok', 'Spituk', 'Phyang', 'Sankar', 'Matho', 'Stakna', 'Rumtse', 'Turtuk', 'Diskit']
    },
    {
        name: 'Lakshadweep',
        capital: 'Kavaratti',
        type: 'union_territory',
        cities: ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Bitra', 'Chetlat', 'Kadmat', 'Kalpeni', 'Kiltan', 'Minicoy', 'Bangaram', 'Parali', 'Suheli', 'Tilakkam', 'Valiyakara', 'Viringili', 'Cheriyam', 'Pitti', 'Kadmat', 'Agatti']
    },
    {
        name: 'Puducherry',
        capital: 'Puducherry',
        type: 'union_territory',
        cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Ozhukarai', 'Villianur', 'Thirubuvanai', 'Nettapakkam', 'Mannadipet', 'Ariyankuppam', 'Mudaliarpet', 'Kalapet', 'Lawspet', 'Indira Nagar', 'Anna Nagar', 'Jawahar Nagar', 'Bharathi Nagar', 'Kurumbapet', 'Reddiarpalayam', 'Seddapet']
    }
];

// Helper functions
export const getAllStates = (): StateInfo[] => {
    return INDIAN_STATES_AND_CITIES;
};

export const getStatesByType = (type: 'state' | 'union_territory'): StateInfo[] => {
    return INDIAN_STATES_AND_CITIES.filter(state => state.type === type);
};

export const getCitiesByState = (stateName: string): string[] => {
    const state = INDIAN_STATES_AND_CITIES.find(s => s.name === stateName);
    return state ? state.cities : [];
};

export const getStateByCity = (cityName: string): string | null => {
    const state = INDIAN_STATES_AND_CITIES.find(s => 
        s.cities.some(city => city.toLowerCase() === cityName.toLowerCase())
    );
    return state ? state.name : null;
};

export const searchStates = (query: string): StateInfo[] => {
    if (!query || query.length < 2) return [];
    
    return INDIAN_STATES_AND_CITIES.filter(state => 
        state.name.toLowerCase().includes(query.toLowerCase()) ||
        state.capital.toLowerCase().includes(query.toLowerCase())
    );
};

export const searchCities = (query: string, stateName?: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const statesToSearch = stateName 
        ? INDIAN_STATES_AND_CITIES.filter(s => s.name === stateName)
        : INDIAN_STATES_AND_CITIES;
    
    const cities: string[] = [];
    statesToSearch.forEach(state => {
        state.cities.forEach(city => {
            if (city.toLowerCase().includes(query.toLowerCase())) {
                cities.push(city);
            }
        });
    });
    
    return [...new Set(cities)].sort();
};
