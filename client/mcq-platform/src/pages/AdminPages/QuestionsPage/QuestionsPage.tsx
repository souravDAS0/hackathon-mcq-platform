import { FC, useState, useEffect } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
} from "@mui/material";
import QuestionListItem from "../../../components/QuestionListItem/QuestionListItem";
import { fetchAllMcqs, deleteMCQ } from "../../../services/api/questionService";
import styles from "./QuestionsPage.module.scss";
import CreateQuestionModal from "../../../components/CreateQuestionModal/CreateQuestionModal";
import { QuizData } from "../../../interfaces/QuizData";
import { CategoryEnum } from "../../../enums/categoryEnum";

const QuestionsPage: FC = () => {
  const [quizData, setQuizData] = useState<QuizData[]>([]);
  const [filteredQuizData, setFilteredQuizData] = useState<QuizData[]>([]); // For filtered quizzes
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<QuizData | null>(null); // Track which question is being edited
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const fetchQuizData = async () => {
    try {
      const response = await fetchAllMcqs();
      setQuizData(response); // Assuming the API response is the array of questions
      setFilteredQuizData(response); // Initialize the filtered data
      setIsLoading(false);
    } catch (error) {
      setError("Failed to load quiz data. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData(); // Fetch data when the component loads
  }, []);

  const handleOpenCreateModal = () => {
    setEditData(null); // Clear the edit data for creating a new question
    setOpenModal(true); // Open the modal
  };

  const handleOpenEditModal = (data: QuizData) => {
    setEditData(data); // Set the question data to be edited
    setOpenModal(true); // Open the modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
    fetchQuizData(); // Refresh the data after closing the modal (for create or update)
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteMCQ(id); // API call to delete MCQ
      fetchQuizData(); // Refresh the list after deletion
      setSnackbarMessage(response.message);
      setSnackbarSeverity("success"); // Set to error in case of failure
      setSnackbarOpen(true);
    } catch (error: any) {
      setError("Failed to delete the question. Please try again.");
      setSnackbarMessage(
        "Error: " + error.response?.data?.message || "Something went wrong."
      );
      setSnackbarSeverity("error"); // Set to error in case of failure
      setSnackbarOpen(true);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const category = event.target.value as string;
    setSelectedCategory(category);
    // Filter quizzes based on the selected category
    if (category === "") {
      setFilteredQuizData(quizData); // Show all quizzes if no category is selected
    } else {
      setFilteredQuizData(
        quizData.filter((quiz) => quiz.category === category)
      );
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.QuestionsPage}>
      {/* Filter for category */}

      <div className={styles.questionsHeader}>
        <Button
          variant="contained"
          className={styles.createButton}
          onClick={handleOpenCreateModal} // Open modal for creating a new question
        >
          Create New Question
        </Button>

        <FormControl variant="outlined" className={styles.filterControl}>
          <InputLabel
            id="category-filter-label"
            sx={{ color: "#e2dfd0", fontWeight: 400 }}
          >
            {" "}
            Category
          </InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Filter by Category"
            sx={{
              color: "#333", // Optional: customize text color
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#aaa", // Optional: customize border color
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#777", // Change border color on hover
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2", // Change border color when focused
              },
            }}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {Object.values(CategoryEnum).map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {filteredQuizData.map((item) => (
        <QuestionListItem
          key={item._id}
          quizData={item}
          onEdit={() => handleOpenEditModal(item)} // Pass the data to the modal for editing
          onDelete={() => handleDelete(item._id)} // Pass the delete handler
        />
      ))}

      {/* Modal for creating/editing question */}
      <CreateQuestionModal
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData} // Pass edit data if available
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity} // Dynamic severity: success or error
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default QuestionsPage;
