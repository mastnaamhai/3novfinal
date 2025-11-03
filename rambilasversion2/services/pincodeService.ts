interface PincodeDetails {
    pincode: string;
    city: string;
    state: string;
    area: string;
    district: string;
    country: string;
}

interface PincodeApiResponse {
    success: boolean;
    data?: PincodeDetails;
    error?: string;
}

// Comprehensive pincode data for major Indian cities
const PINCODE_DATABASE: { [key: string]: PincodeDetails } = {
    // Delhi
    '110001': { pincode: '110001', city: 'New Delhi', state: 'Delhi', area: 'Connaught Place', district: 'Central Delhi', country: 'India' },
    '110002': { pincode: '110002', city: 'New Delhi', state: 'Delhi', area: 'Daryaganj', district: 'Central Delhi', country: 'India' },
    '110003': { pincode: '110003', city: 'New Delhi', state: 'Delhi', area: 'Paharganj', district: 'Central Delhi', country: 'India' },
    '110004': { pincode: '110004', city: 'New Delhi', state: 'Delhi', area: 'Karol Bagh', district: 'Central Delhi', country: 'India' },
    '110005': { pincode: '110005', city: 'New Delhi', state: 'Delhi', area: 'Rajiv Chowk', district: 'Central Delhi', country: 'India' },
    '110006': { pincode: '110006', city: 'New Delhi', state: 'Delhi', area: 'India Gate', district: 'Central Delhi', country: 'India' },
    '110007': { pincode: '110007', city: 'New Delhi', state: 'Delhi', area: 'Lodi Road', district: 'Central Delhi', country: 'India' },
    '110008': { pincode: '110008', city: 'New Delhi', state: 'Delhi', area: 'Jantar Mantar', district: 'Central Delhi', country: 'India' },
    '110009': { pincode: '110009', city: 'New Delhi', state: 'Delhi', area: 'Rashtrapati Bhavan', district: 'Central Delhi', country: 'India' },
    '110010': { pincode: '110010', city: 'New Delhi', state: 'Delhi', area: 'South Block', district: 'Central Delhi', country: 'India' },
    
    // Mumbai, Maharashtra
    '400001': { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', area: 'Fort', district: 'Mumbai', country: 'India' },
    '400002': { pincode: '400002', city: 'Mumbai', state: 'Maharashtra', area: 'Masjid Bunder', district: 'Mumbai', country: 'India' },
    '400003': { pincode: '400003', city: 'Mumbai', state: 'Maharashtra', area: 'Marine Lines', district: 'Mumbai', country: 'India' },
    '400004': { pincode: '400004', city: 'Mumbai', state: 'Maharashtra', area: 'Grant Road', district: 'Mumbai', country: 'India' },
    '400005': { pincode: '400005', city: 'Mumbai', state: 'Maharashtra', area: 'CST', district: 'Mumbai', country: 'India' },
    '400006': { pincode: '400006', city: 'Mumbai', state: 'Maharashtra', area: 'Byculla', district: 'Mumbai', country: 'India' },
    '400007': { pincode: '400007', city: 'Mumbai', state: 'Maharashtra', area: 'Mazgaon', district: 'Mumbai', country: 'India' },
    '400008': { pincode: '400008', city: 'Mumbai', state: 'Maharashtra', area: 'Wadala', district: 'Mumbai', country: 'India' },
    '400009': { pincode: '400009', city: 'Mumbai', state: 'Maharashtra', area: 'Sewri', district: 'Mumbai', country: 'India' },
    '400010': { pincode: '400010', city: 'Mumbai', state: 'Maharashtra', area: 'Dadar', district: 'Mumbai', country: 'India' },
    
    // Bangalore, Karnataka
    '560001': { pincode: '560001', city: 'Bangalore', state: 'Karnataka', area: 'Cubbonpet', district: 'Bangalore Urban', country: 'India' },
    '560002': { pincode: '560002', city: 'Bangalore', state: 'Karnataka', area: 'Chickpet', district: 'Bangalore Urban', country: 'India' },
    '560003': { pincode: '560003', city: 'Bangalore', state: 'Karnataka', area: 'Chamrajpet', district: 'Bangalore Urban', country: 'India' },
    '560004': { pincode: '560004', city: 'Bangalore', state: 'Karnataka', area: 'Basavanagudi', district: 'Bangalore Urban', country: 'India' },
    '560005': { pincode: '560005', city: 'Bangalore', state: 'Karnataka', area: 'Malleshwaram', district: 'Bangalore Urban', country: 'India' },
    '560006': { pincode: '560006', city: 'Bangalore', state: 'Karnataka', area: 'Rajajinagar', district: 'Bangalore Urban', country: 'India' },
    '560007': { pincode: '560007', city: 'Bangalore', state: 'Karnataka', area: 'Shivajinagar', district: 'Bangalore Urban', country: 'India' },
    '560008': { pincode: '560008', city: 'Bangalore', state: 'Karnataka', area: 'Vasanthnagar', district: 'Bangalore Urban', country: 'India' },
    '560009': { pincode: '560009', city: 'Bangalore', state: 'Karnataka', area: 'Ulsoor', district: 'Bangalore Urban', country: 'India' },
    '560010': { pincode: '560010', city: 'Bangalore', state: 'Karnataka', area: 'Indiranagar', district: 'Bangalore Urban', country: 'India' },
    
    // Chennai, Tamil Nadu
    '600001': { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', area: 'Parrys', district: 'Chennai', country: 'India' },
    '600002': { pincode: '600002', city: 'Chennai', state: 'Tamil Nadu', area: 'George Town', district: 'Chennai', country: 'India' },
    '600003': { pincode: '600003', city: 'Chennai', state: 'Tamil Nadu', area: 'Egmore', district: 'Chennai', country: 'India' },
    '600004': { pincode: '600004', city: 'Chennai', state: 'Tamil Nadu', area: 'T. Nagar', district: 'Chennai', country: 'India' },
    '600005': { pincode: '600005', city: 'Chennai', state: 'Tamil Nadu', area: 'Triplicane', district: 'Chennai', country: 'India' },
    '600006': { pincode: '600006', city: 'Chennai', state: 'Tamil Nadu', area: 'Mylapore', district: 'Chennai', country: 'India' },
    '600007': { pincode: '600007', city: 'Chennai', state: 'Tamil Nadu', area: 'Adyar', district: 'Chennai', country: 'India' },
    '600008': { pincode: '600008', city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar', district: 'Chennai', country: 'India' },
    '600009': { pincode: '600009', city: 'Chennai', state: 'Tamil Nadu', area: 'Saidapet', district: 'Chennai', country: 'India' },
    '600010': { pincode: '600010', city: 'Chennai', state: 'Tamil Nadu', area: 'Nungambakkam', district: 'Chennai', country: 'India' },
    
    // Kolkata, West Bengal
    '700001': { pincode: '700001', city: 'Kolkata', state: 'West Bengal', area: 'BBD Bagh', district: 'Kolkata', country: 'India' },
    '700002': { pincode: '700002', city: 'Kolkata', state: 'West Bengal', area: 'Dalhousie', district: 'Kolkata', country: 'India' },
    '700003': { pincode: '700003', city: 'Kolkata', state: 'West Bengal', area: 'Esplanade', district: 'Kolkata', country: 'India' },
    '700004': { pincode: '700004', city: 'Kolkata', state: 'West Bengal', area: 'Park Street', district: 'Kolkata', country: 'India' },
    '700005': { pincode: '700005', city: 'Kolkata', state: 'West Bengal', area: 'Park Circus', district: 'Kolkata', country: 'India' },
    '700006': { pincode: '700006', city: 'Kolkata', state: 'West Bengal', area: 'Tollygunge', district: 'Kolkata', country: 'India' },
    '700007': { pincode: '700007', city: 'Kolkata', state: 'West Bengal', area: 'Ballygunge', district: 'Kolkata', country: 'India' },
    '700008': { pincode: '700008', city: 'Kolkata', state: 'West Bengal', area: 'Alipore', district: 'Kolkata', country: 'India' },
    '700009': { pincode: '700009', city: 'Kolkata', state: 'West Bengal', area: 'New Alipore', district: 'Kolkata', country: 'India' },
    '700010': { pincode: '700010', city: 'Kolkata', state: 'West Bengal', area: 'Tollygunge', district: 'Kolkata', country: 'India' },
    
    // Ahmedabad, Gujarat
    '380001': { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', area: 'Khadia', district: 'Ahmedabad', country: 'India' },
    '380002': { pincode: '380002', city: 'Ahmedabad', state: 'Gujarat', area: 'Kalupur', district: 'Ahmedabad', country: 'India' },
    '380003': { pincode: '380003', city: 'Ahmedabad', state: 'Gujarat', area: 'Jamalpur', district: 'Ahmedabad', country: 'India' },
    '380004': { pincode: '380004', city: 'Ahmedabad', state: 'Gujarat', area: 'Lal Darwaja', district: 'Ahmedabad', country: 'India' },
    '380005': { pincode: '380005', city: 'Ahmedabad', state: 'Gujarat', area: 'Maninagar', district: 'Ahmedabad', country: 'India' },
    '380006': { pincode: '380006', city: 'Ahmedabad', state: 'Gujarat', area: 'Naroda', district: 'Ahmedabad', country: 'India' },
    '380007': { pincode: '380007', city: 'Ahmedabad', state: 'Gujarat', area: 'Bapunagar', district: 'Ahmedabad', country: 'India' },
    '380008': { pincode: '380008', city: 'Ahmedabad', state: 'Gujarat', area: 'Gomtipur', district: 'Ahmedabad', country: 'India' },
    '380009': { pincode: '380009', city: 'Ahmedabad', state: 'Gujarat', area: 'Rakhiyal', district: 'Ahmedabad', country: 'India' },
    '380010': { pincode: '380010', city: 'Ahmedabad', state: 'Gujarat', area: 'Vatva', district: 'Ahmedabad', country: 'India' },
    
    // Jaipur, Rajasthan
    '302001': { pincode: '302001', city: 'Jaipur', state: 'Rajasthan', area: 'Pink City', district: 'Jaipur', country: 'India' },
    '302002': { pincode: '302002', city: 'Jaipur', state: 'Rajasthan', area: 'Walled City', district: 'Jaipur', country: 'India' },
    '302003': { pincode: '302003', city: 'Jaipur', state: 'Rajasthan', area: 'C-Scheme', district: 'Jaipur', country: 'India' },
    '302004': { pincode: '302004', city: 'Jaipur', state: 'Rajasthan', area: 'Bani Park', district: 'Jaipur', country: 'India' },
    '302005': { pincode: '302005', city: 'Jaipur', state: 'Rajasthan', area: 'Vaishali Nagar', district: 'Jaipur', country: 'India' },
    '302006': { pincode: '302006', city: 'Jaipur', state: 'Rajasthan', area: 'Malviya Nagar', district: 'Jaipur', country: 'India' },
    '302007': { pincode: '302007', city: 'Jaipur', state: 'Rajasthan', area: 'Sitapura', district: 'Jaipur', country: 'India' },
    '302008': { pincode: '302008', city: 'Jaipur', state: 'Rajasthan', area: 'Vidyadhar Nagar', district: 'Jaipur', country: 'India' },
    '302009': { pincode: '302009', city: 'Jaipur', state: 'Rajasthan', area: 'Jhotwara', district: 'Jaipur', country: 'India' },
    '302010': { pincode: '302010', city: 'Jaipur', state: 'Rajasthan', area: 'Sanganer', district: 'Jaipur', country: 'India' },
    
    // Hyderabad, Telangana
    '500001': { pincode: '500001', city: 'Hyderabad', state: 'Telangana', area: 'Abids', district: 'Hyderabad', country: 'India' },
    '500002': { pincode: '500002', city: 'Hyderabad', state: 'Telangana', area: 'Charminar', district: 'Hyderabad', country: 'India' },
    '500003': { pincode: '500003', city: 'Hyderabad', state: 'Telangana', area: 'Secunderabad', district: 'Hyderabad', country: 'India' },
    '500004': { pincode: '500004', city: 'Hyderabad', state: 'Telangana', area: 'Begumpet', district: 'Hyderabad', country: 'India' },
    '500005': { pincode: '500005', city: 'Hyderabad', state: 'Telangana', area: 'Himayatnagar', district: 'Hyderabad', country: 'India' },
    '500006': { pincode: '500006', city: 'Hyderabad', state: 'Telangana', area: 'Banjara Hills', district: 'Hyderabad', country: 'India' },
    '500007': { pincode: '500007', city: 'Hyderabad', state: 'Telangana', area: 'Jubilee Hills', district: 'Hyderabad', country: 'India' },
    '500008': { pincode: '500008', city: 'Hyderabad', state: 'Telangana', area: 'Ameerpet', district: 'Hyderabad', country: 'India' },
    '500009': { pincode: '500009', city: 'Hyderabad', state: 'Telangana', area: 'Kukatpally', district: 'Hyderabad', country: 'India' },
    '500010': { pincode: '500010', city: 'Hyderabad', state: 'Telangana', area: 'Miyapur', district: 'Hyderabad', country: 'India' },
    
    // Pune, Maharashtra
    '411001': { pincode: '411001', city: 'Pune', state: 'Maharashtra', area: 'Shivajinagar', district: 'Pune', country: 'India' },
    '411002': { pincode: '411002', city: 'Pune', state: 'Maharashtra', area: 'Camp', district: 'Pune', country: 'India' },
    '411003': { pincode: '411003', city: 'Pune', state: 'Maharashtra', area: 'Shaniwar Peth', district: 'Pune', country: 'India' },
    '411004': { pincode: '411004', city: 'Pune', state: 'Maharashtra', area: 'Kasba Peth', district: 'Pune', country: 'India' },
    '411005': { pincode: '411005', city: 'Pune', state: 'Maharashtra', area: 'Koregaon Park', district: 'Pune', country: 'India' },
    '411006': { pincode: '411006', city: 'Pune', state: 'Maharashtra', area: 'Bund Garden', district: 'Pune', country: 'India' },
    '411007': { pincode: '411007', city: 'Pune', state: 'Maharashtra', area: 'Aundh', district: 'Pune', country: 'India' },
    '411008': { pincode: '411008', city: 'Pune', state: 'Maharashtra', area: 'Baner', district: 'Pune', country: 'India' },
    '411009': { pincode: '411009', city: 'Pune', state: 'Maharashtra', area: 'Hinjewadi', district: 'Pune', country: 'India' },
    '411010': { pincode: '411010', city: 'Pune', state: 'Maharashtra', area: 'Wakad', district: 'Pune', country: 'India' }
};

// Function to validate pincode format
export const validatePincode = (pincode: string): boolean => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
};

// Function to fetch pincode details
export const fetchPincodeDetails = async (pincode: string): Promise<PincodeApiResponse> => {
    try {
        // Validate pincode format
        if (!validatePincode(pincode)) {
            return {
                success: false,
                error: 'Invalid pincode format. Please enter a 6-digit pincode starting with 1-9.'
            };
        }

        // Check if pincode exists in our database
        const pincodeData = PINCODE_DATABASE[pincode];
        
        if (pincodeData) {
            return {
                success: true,
                data: pincodeData
            };
        }

        // If not found in local database, you can integrate with external APIs here
        // For now, we'll return a generic response for unknown pincodes
        return {
            success: false,
            error: 'Pincode not found in our database. Please enter the city and state manually.'
        };

    } catch (error) {
        console.error('Error fetching pincode details:', error);
        return {
            success: false,
            error: 'Failed to fetch pincode details. Please try again.'
        };
    }
};

// Function to search pincodes by partial input
export const searchPincodes = (query: string): PincodeDetails[] => {
    if (!query || query.length < 2) return [];
    
    const results = Object.values(PINCODE_DATABASE).filter(pincode => 
        pincode.pincode.includes(query) ||
        pincode.city.toLowerCase().includes(query.toLowerCase()) ||
        pincode.state.toLowerCase().includes(query.toLowerCase()) ||
        pincode.area.toLowerCase().includes(query.toLowerCase())
    );
    
    return results.slice(0, 10); // Limit to 10 results
};

// Function to get all unique states
export const getAllStates = (): string[] => {
    const states = new Set<string>();
    Object.values(PINCODE_DATABASE).forEach(pincode => {
        states.add(pincode.state);
    });
    return Array.from(states).sort();
};

// Function to get cities by state
export const getCitiesByState = (state: string): string[] => {
    const cities = new Set<string>();
    Object.values(PINCODE_DATABASE).forEach(pincode => {
        if (pincode.state === state) {
            cities.add(pincode.city);
        }
    });
    return Array.from(cities).sort();
};

// Function to get areas by city
export const getAreasByCity = (city: string): string[] => {
    const areas = new Set<string>();
    Object.values(PINCODE_DATABASE).forEach(pincode => {
        if (pincode.city === city) {
            areas.add(pincode.area);
        }
    });
    return Array.from(areas).sort();
};

export type { PincodeDetails, PincodeApiResponse };
