require 'set'

class BookSorter

  def initialize(source_file)
    @chunk_size  ||= 1024
    @source_file ||= source_file
  end

  def sort 
    File.open(@source_file) do |file|
      
      word_set    = Set.new
      word_counts = Hash.new

      until file.eof?
        chunk = file.read(@chunk_size)
        chunk_word_array = chunk.scan(/[a-zA-Z][a-z]+/)
        
        chunk_word_array.each do |word|
          next if word.length < 3 # skip words less than 3 characters
          
          word = "\"#{ word.downcase }\"" # format these nicely
          new_word = word_set.add?(word) # add? returns the set if added, or nil if duplicate
        
          word_counts[word] = 0 if new_word
          word_counts[word] += 1
        
        end 
      end

      ordered_word_set = word_set.to_a.sort do |word1, word2|
        word_counts[word1] <=> word_counts[word2]
      end.reverse!

      word_set_string = ordered_word_set * ', '
      word_set_string = "[ #{ word_set_string } ]"

      File.open('resources/word_set.txt', 'w') { |file| file.write(word_set_string) }
    
    end
  end

end

sorter = BookSorter.new('../amusements-in-mathematics.txt')
sorter.sort
