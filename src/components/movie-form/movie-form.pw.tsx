/* eslint-disable @typescript-eslint/no-explicit-any */
import type {MountResult} from '@playwright/experimental-ct-react'
import {test, expect} from '@playwright/experimental-ct-react'
import MovieForm from './movie-form'
import {generateMovie} from '@cypress/support/factories'
import {interceptNetworkCall} from '@pw/support/utils/network'
import type {Movie} from 'src/consumer'

// Helper Functions
const getByPlaceholder = (component: MountResult, placeholder: string) =>
  component.getByPlaceholder(placeholder)
const getByText = (component: MountResult, text: string) =>
  component.getByText(text)
const getByTestId = (component: MountResult, testId: string) =>
  component.getByTestId(testId)

const fillName = async (component: MountResult, name: string) =>
  getByPlaceholder(component, 'Movie name').fill(name)

const fillYear = async (component: MountResult, year: string) =>
  getByPlaceholder(component, 'Movie year').fill(year)

const fillRating = async (component: MountResult, rating: string) =>
  getByPlaceholder(component, 'Movie rating').fill(rating)

const fillDirector = async (component: MountResult, director: string) =>
  getByPlaceholder(component, 'Movie director').fill(director)

const clickAddMovie = async (component: MountResult) =>
  getByText(component, 'Add Movie').click()

test.describe('<MovieForm />', () => {
  const {name, year, rating, director} = generateMovie()
  const id = 1
  const movie: Movie = {id, name, year, rating, director}

  test('should fill the form and add the movie', async ({mount, page}) => {
    const component = await mount(<MovieForm />)

    // Fill the form using helpers
    await fillName(component, name)
    await fillYear(component, String(year))
    await fillRating(component, String(rating))
    await fillDirector(component, director)

    // Mock the network
    const loadPostOrGetMovies = interceptNetworkCall({
      method: 'POST',
      url: '/movies',
      page,
      fulfillResponse: {
        status: 200,
        body: movie,
      },
    })

    // Perform the action
    await clickAddMovie(component)

    const {data} = await loadPostOrGetMovies

    // Check the network request payload
    expect(data).toEqual({
      id,
      name,
      year,
      rating,
      director,
    })

    // PW CT is in beta: can't see the button in the transitionary state
    // await expect(component.getByText('Adding...')).toBeVisible()

    // Check form reset
    const nameInput = getByPlaceholder(component, 'Movie name')
    const yearInput = getByPlaceholder(component, 'Movie year')
    const ratingInput = getByPlaceholder(component, 'Movie rating')

    await expect(nameInput).toHaveValue('')
    await expect(yearInput).toHaveValue('2023') // Assuming 2023 is the reset value
    await expect(ratingInput).toHaveValue('0') // Assuming 0 is the reset value
  })

  test('should exercise validation errors', async ({mount}) => {
    const component = await mount(<MovieForm />)

    // Initial validation: Year 2025
    await fillYear(component, '2025')
    await clickAddMovie(component)

    let validationErrors = getByTestId(component, 'validation-error')
    await expect(validationErrors).toHaveCount(3)

    // Validation: Year 1899
    await fillYear(component, '1899')
    await clickAddMovie(component)

    validationErrors = getByTestId(component, 'validation-error')
    await expect(validationErrors).toHaveCount(3)
    await expect(
      component.getByText('Number must be greater than or equal to 1900'),
    ).toBeVisible()

    // Correcting Year and filling other fields
    await fillYear(component, '2024')
    await fillName(component, '4')
    await fillDirector(component, 'Christopher Nolan')
    await clickAddMovie(component)

    // Ensure no validation errors
    validationErrors = getByTestId(component, 'validation-error')
    await expect(validationErrors).toHaveCount(0)
    await expect(component.getByText('Name is required')).not.toBeVisible()

    // Another validation correction
    await fillYear(component, '1900')
    await fillName(component, '4')
    await fillDirector(component, 'Christopher Nolan')
    await clickAddMovie(component)

    // Ensure no validation errors
    validationErrors = getByTestId(component, 'validation-error')
    await expect(validationErrors).toHaveCount(0)
    await expect(component.getByText('Name is required')).not.toBeVisible()
  })
})
