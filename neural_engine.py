import numpy as np

class DenseLayer:
    """न्यूरल नेटवर्क की एक डेंस (फुल्ली कनेक्टेड) लेयर"""
    def __init__(self, input_dim, output_dim, activation='relu'):
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.activation = activation
        
        # Xavier/He Initialization
        limit = np.sqrt(2.0 / (input_dim + output_dim))
        np.random.seed(42)  # रीप्रोड्यूसिबल वेट्स
        self.weights = np.random.uniform(-limit, limit, (input_dim, output_dim))
        self.biases = np.zeros((1, output_dim))

    def forward(self, inputs):
        # z = X * W + b
        self.z = np.dot(inputs, self.weights) + self.biases
        
        if self.activation == 'relu':
            return np.maximum(0, self.z)
        elif self.activation == 'softmax':
            exp_z = np.exp(self.z - np.max(self.z, axis=1, keepdims=True))
            return exp_z / np.sum(exp_z, axis=1, keepdims=True)
        elif self.activation == 'sigmoid':
            return 1.0 / (1.0 + np.exp(-np.clip(self.z, -250, 250)))
        return self.z

class SemanticNeuralNetwork:
    """
    3-लेयर डीप न्यूरल नेटवर्क (Multi-Layer Perceptron):
    Input Layer -> Hidden Layer 1 (ReLU) -> Hidden Layer 2 (ReLU) -> Output Layer (Softmax)
    """
    def __init__(self, input_dim=128, hidden_dim1=64, hidden_dim2=32, output_dim=10):
        self.input_dim = input_dim
        self.hidden_dim1 = hidden_dim1
        self.hidden_dim2 = hidden_dim2
        self.output_dim = output_dim
        
        self.layer1 = DenseLayer(input_dim, hidden_dim1, activation='relu')
        self.layer2 = DenseLayer(hidden_dim1, hidden_dim2, activation='relu')
        self.layer3 = DenseLayer(hidden_dim2, output_dim, activation='softmax')

    def forward(self, x):
        """फॉरवर्ड पास: इनपुट को न्यूरॉन्स की परतों से गुजारना"""
        a1 = self.layer1.forward(x)
        a2 = self.layer2.forward(a1)
        output_probs = self.layer3.forward(a2)
        return {
            "a1": a1,
            "a2": a2,
            "output_probs": output_probs
        }

    def get_architecture(self):
        """न्यूरल नेटवर्क की संरचना (विजुअलाइज़र के लिए)"""
        total_params = (
            (self.input_dim * self.hidden_dim1 + self.hidden_dim1) +
            (self.hidden_dim1 * self.hidden_dim2 + self.hidden_dim2) +
            (self.hidden_dim2 * self.output_dim + self.output_dim)
        )
        return {
            "layers": [
                {"name": "Input Layer", "neurons": self.input_dim, "activation": "Vector Embeddings"},
                {"name": "Hidden Layer 1", "neurons": self.hidden_dim1, "activation": "ReLU"},
                {"name": "Hidden Layer 2", "neurons": self.hidden_dim2, "activation": "ReLU"},
                {"name": "Output Layer", "neurons": self.output_dim, "activation": "Softmax"}
            ],
            "total_parameters": int(total_params)
        }
