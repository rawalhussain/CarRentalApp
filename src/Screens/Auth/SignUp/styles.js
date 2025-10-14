import { StyleSheet } from 'react-native';
import { Colors } from '../../../Themes/MyColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GREY,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 30,
  },
  headerContainer: {
    backgroundColor: Colors.BACKGROUND_GREY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LINE_GRAY,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 3,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.BLACK,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  // User Type Selection Styles
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 10,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LINE_GRAY,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  userTypeButtonText: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  userTypeButtonTextActive: {
    color: Colors.WHITE,
  },
  button: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: Colors.PRIMARY_GREY,
  },
  footerLink: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    borderColor: Colors.LINE_GRAY,
    borderTopWidth: 1,
  },
  orText: {
    fontSize: 14,
    color: Colors.PRIMARY_GREY,
    paddingHorizontal: 20,
  },
});

export default styles;
